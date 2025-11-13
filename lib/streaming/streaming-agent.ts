/**
 * Streaming Agent - Enterprise AI Agent with Fine-Grained Tool Streaming
 *
 * Features:
 * - Streaming input mode for interactive scenarios
 * - Fine-grained tool streaming for 3s vs 15s latency improvement
 * - Automatic tool execution loop
 * - Message history management
 * - Usage tracking integration
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  Message,
  UserMessage,
  AssistantMessage,
  StreamingConfig,
  AgentMessage,
  StreamEvent,
  ToolDefinition,
  ContentBlock,
  ToolResult
} from "../types";

export class StreamingAgent {
  private client: Anthropic;
  private conversationHistory: Message[] = [];
  private processedMessageIds: Set<string> = new Set();
  private systemPrompt?: string;
  private toolDefinitions: ToolDefinition[] = [];

  constructor(apiKey: string, systemPrompt?: string) {
    this.client = new Anthropic({
      apiKey
    });
    this.systemPrompt = systemPrompt;
  }

  /**
   * Set tool definitions for the agent
   */
  setTools(tools: ToolDefinition[]): void {
    this.toolDefinitions = tools;
  }

  /**
   * Add a tool definition
   */
  addTool(tool: ToolDefinition): void {
    this.toolDefinitions.push(tool);
  }

  /**
   * Get tool definitions filtered by allowed tools
   */
  private getToolDefinitions(allowedTools?: string[]): ToolDefinition[] {
    if (!allowedTools || allowedTools.length === 0) {
      return this.toolDefinitions;
    }

    return this.toolDefinitions.filter(tool =>
      allowedTools.includes(tool.name)
    );
  }

  /**
   * Streaming query with async generator for input and output
   *
   * @param messageGenerator - Async generator yielding user messages
   * @param config - Streaming configuration
   * @returns Async generator yielding agent messages
   */
  async *query(
    messageGenerator: AsyncGenerator<UserMessage>,
    config: StreamingConfig = {}
  ): AsyncGenerator<AgentMessage> {
    const betas = config.betas || [];

    // Add fine-grained streaming for performance (3s vs 15s latency)
    if (!betas.includes("fine-grained-tool-streaming-2025-05-14")) {
      betas.push("fine-grained-tool-streaming-2025-05-14");
    }

    let turns = 0;
    const maxTurns = config.maxTurns || 20;

    // Iterate through incoming user messages
    for await (const userMessage of messageGenerator) {
      this.conversationHistory.push(userMessage);

      // Agentic loop: continue until no more tool uses or max turns reached
      while (turns < maxTurns) {
        turns++;

        const requestParams: any = {
          model: config.model || "claude-sonnet-4-5",
          max_tokens: config.maxTokens || 4096,
          messages: this.conversationHistory,
          temperature: config.temperature,
          betas
        };

        // Add system prompt if provided
        if (this.systemPrompt || config.systemPrompt) {
          requestParams.system = config.systemPrompt || this.systemPrompt;
        }

        // Add tools if available
        const tools = this.getToolDefinitions(config.allowedTools);
        if (tools.length > 0) {
          requestParams.tools = tools;
        }

        // Stream the response
        const stream = await this.client.messages.stream(requestParams);

        // Yield stream events as they arrive
        for await (const event of stream) {
          const agentMessage = this.processStreamEvent(event);
          if (agentMessage) {
            yield agentMessage;
          }
        }

        // Get the final message
        const message = await stream.finalMessage();

        // Track message ID to avoid double-processing
        if (message.id && !this.processedMessageIds.has(message.id)) {
          this.processedMessageIds.add(message.id);

          // Yield complete assistant message with usage data
          yield {
            type: "assistant",
            id: message.id,
            model: message.model,
            content: message.content,
            usage: message.usage,
            stop_reason: message.stop_reason,
            timestamp: new Date()
          };
        }

        // Add assistant message to history
        this.conversationHistory.push({
          role: "assistant",
          content: message.content
        });

        // Check if we need to continue the loop
        if (message.stop_reason === "tool_use") {
          // Execute tools and add results to conversation
          const toolResults = await this.executeTools(message.content);

          if (toolResults.length > 0) {
            this.conversationHistory.push({
              role: "user",
              content: toolResults
            });

            // Continue the loop to process tool results
            continue;
          }
        }

        // Stop the loop if no more tool uses
        break;
      }

      // Check if max turns exceeded
      if (turns >= maxTurns) {
        yield {
          type: "error",
          content: [{
            type: "text",
            text: `Maximum turns (${maxTurns}) exceeded. Consider increasing maxTurns or simplifying the task.`
          }],
          timestamp: new Date()
        };
      }

      // Reset turns for next user message
      turns = 0;
    }
  }

  /**
   * Single message query (non-streaming input mode)
   *
   * @param userMessage - User message
   * @param config - Streaming configuration
   * @returns Async generator yielding agent messages
   */
  async *querySingle(
    userMessage: string | UserMessage,
    config: StreamingConfig = {}
  ): AsyncGenerator<AgentMessage> {
    // Convert string to UserMessage
    const message: UserMessage = typeof userMessage === "string"
      ? { role: "user", content: userMessage }
      : userMessage;

    // Create a single-item async generator
    async function* singleMessageGenerator(): AsyncGenerator<UserMessage> {
      yield message;
    }

    // Use the main query method
    yield* this.query(singleMessageGenerator(), config);
  }

  /**
   * Process stream events and convert to AgentMessage
   */
  private processStreamEvent(event: StreamEvent): AgentMessage | null {
    switch (event.type) {
      case "content_block_start":
        if (event.content_block?.type === "thinking") {
          return {
            type: "thinking",
            content: [event.content_block],
            timestamp: new Date()
          };
        }
        break;

      case "content_block_delta":
        if (event.delta?.type === "text_delta") {
          return {
            type: "text",
            content: [{
              type: "text",
              text: event.delta.text
            }],
            timestamp: new Date()
          };
        }
        break;

      case "message_delta":
        if (event.usage) {
          return {
            type: "assistant",
            content: [],
            usage: event.usage,
            timestamp: new Date()
          };
        }
        break;
    }

    return null;
  }

  /**
   * Execute tools from assistant message
   * Override this method to implement custom tool execution
   */
  protected async executeTools(content: ContentBlock[]): Promise<ToolResult[]> {
    const toolUses = content.filter(block => block.type === "tool_use");
    const results: ToolResult[] = [];

    for (const toolUse of toolUses) {
      try {
        // This is a placeholder - override in subclass or set a tool executor
        const result = await this.executeTool(toolUse.name!, toolUse.input);

        results.push({
          tool_use_id: toolUse.tool_use_id || "",
          content: typeof result === "string" ? result : JSON.stringify(result)
        });
      } catch (error: any) {
        results.push({
          tool_use_id: toolUse.tool_use_id || "",
          content: error.message || "Tool execution failed",
          is_error: true
        });
      }
    }

    return results;
  }

  /**
   * Execute a single tool
   * Override this method to implement custom tool execution logic
   */
  protected async executeTool(toolName: string, input: any): Promise<any> {
    throw new Error(
      `Tool execution not implemented for: ${toolName}. ` +
      `Override executeTool() method to implement custom tool execution.`
    );
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
    this.processedMessageIds.clear();
  }

  /**
   * Get conversation history
   */
  getHistory(): Message[] {
    return [...this.conversationHistory];
  }

  /**
   * Set system prompt
   */
  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  /**
   * Get system prompt
   */
  getSystemPrompt(): string | undefined {
    return this.systemPrompt;
  }
}

/**
 * Example usage:
 *
 * const agent = new StreamingAgent(apiKey, systemPrompt);
 *
 * agent.setTools([
 *   {
 *     name: "calculator",
 *     description: "Performs basic arithmetic",
 *     input_schema: {
 *       type: "object",
 *       properties: {
 *         operation: { type: "string" },
 *         a: { type: "number" },
 *         b: { type: "number" }
 *       },
 *       required: ["operation", "a", "b"]
 *     }
 *   }
 * ]);
 *
 * // Streaming input mode
 * async function* userMessages() {
 *   yield { role: "user", content: "Calculate 5 + 3" };
 *   yield { role: "user", content: "Now multiply the result by 2" };
 * }
 *
 * for await (const message of agent.query(userMessages())) {
 *   if (message.type === "text") {
 *     process.stdout.write(message.content[0].text);
 *   }
 * }
 *
 * // Single message mode
 * for await (const message of agent.querySingle("What is 10 * 5?")) {
 *   if (message.type === "text") {
 *     console.log(message.content[0].text);
 *   }
 * }
 */
