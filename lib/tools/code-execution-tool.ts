/**
 * Code Execution Tool - Secure Python Code Execution in Containers
 *
 * Features:
 * - Python 3.11.12 execution in isolated Docker containers
 * - Container reuse for stateful sessions (30-day lifetime)
 * - File persistence across executions
 * - Resource limits (5GB RAM, 5GB disk)
 * - No internet access (network isolation)
 * - Comprehensive error handling
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  CodeExecutionConfig,
  Container,
  ContainerFile,
  CodeExecutionResult,
  ToolExecutionError
} from "../types";

export class CodeExecutionTool {
  private client: Anthropic;
  private containerRegistry: Map<string, Container> = new Map();
  private containerLifetimeDays: number;
  private freeHoursPerDay: number;

  constructor(config: {
    apiKey: string;
    containerLifetimeDays?: number;
    freeHoursPerDay?: number;
  }) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      defaultHeaders: {
        "anthropic-beta": "code-execution-2025-08-25"
      }
    });

    this.containerLifetimeDays = config.containerLifetimeDays || 30;
    this.freeHoursPerDay = config.freeHoursPerDay || 50;
  }

  /**
   * Execute Python code in a secure container
   */
  async execute(
    code: string,
    config: CodeExecutionConfig = {}
  ): Promise<CodeExecutionResult> {
    try {
      const tools = [{
        type: "code_execution_20250825",
        name: "code_execution"
      }];

      // Build request
      const request: any = {
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        tools,
        messages: [{
          role: "user",
          content: this.buildPrompt(code, config)
        }]
      };

      // Add container ID if provided (for session reuse)
      if (config.containerId) {
        request.container_id = config.containerId;
      }

      // Execute code via Claude
      const response = await this.client.messages.create(request);

      // Extract code execution result
      for (const block of response.content) {
        if (block.type === "tool_use" && block.name === "code_execution") {
          const result = block.input;

          // Register container if returned
          if (response.container_id) {
            this.registerContainer(response.container_id, config.files || []);
          }

          return {
            stdout: result.stdout || "",
            stderr: result.stderr || "",
            returnCode: result.return_code || 0,
            metadata: result.metadata,
            errorCode: result.error_code,
            containerId: response.container_id
          };
        }
      }

      // If no tool use found, return text response
      const textBlocks = response.content.filter(
        block => block.type === "text"
      );

      if (textBlocks.length > 0) {
        return {
          stdout: textBlocks.map(b => b.text).join("\n"),
          stderr: "",
          returnCode: 0,
          containerId: response.container_id
        };
      }

      throw new ToolExecutionError("No code execution result found in response");
    } catch (error: any) {
      if (error instanceof ToolExecutionError) {
        throw error;
      }

      throw new ToolExecutionError(
        `Code execution failed: ${error.message}`
      );
    }
  }

  /**
   * Build prompt for code execution
   */
  private buildPrompt(code: string, config: CodeExecutionConfig): string {
    const language = config.language || "python";

    let prompt = `Execute this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;

    if (config.files && config.files.length > 0) {
      prompt += "\n\nFiles to create before execution:\n";
      for (const file of config.files) {
        prompt += `\n**${file.path}**:\n\`\`\`\n${file.content}\n\`\`\``;
      }
    }

    return prompt;
  }

  /**
   * Register a container in the registry
   */
  private registerContainer(containerId: string, files: ContainerFile[]): void {
    const container = this.containerRegistry.get(containerId);

    if (container) {
      container.lastUsed = new Date();
      container.files = files;
    } else {
      this.containerRegistry.set(containerId, {
        id: containerId,
        createdAt: new Date(),
        lastUsed: new Date(),
        files
      });
    }
  }

  /**
   * Get container information
   */
  getContainer(containerId: string): Container | undefined {
    return this.containerRegistry.get(containerId);
  }

  /**
   * List all containers
   */
  listContainers(): Container[] {
    return Array.from(this.containerRegistry.values());
  }

  /**
   * Clean up expired containers
   */
  cleanupExpiredContainers(): string[] {
    const now = new Date();
    const expirationMs = this.containerLifetimeDays * 24 * 60 * 60 * 1000;
    const expired: string[] = [];

    for (const [id, container] of this.containerRegistry.entries()) {
      const age = now.getTime() - container.createdAt.getTime();

      if (age > expirationMs) {
        this.containerRegistry.delete(id);
        expired.push(id);
      }
    }

    return expired;
  }

  /**
   * Execute code with automatic retry on container errors
   */
  async executeWithRetry(
    code: string,
    config: CodeExecutionConfig = {},
    maxRetries: number = 3
  ): Promise<CodeExecutionResult> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.execute(code, config);
      } catch (error: any) {
        lastError = error;

        // Don't retry on user code errors
        if (error.message.includes("return_code")) {
          throw error;
        }

        // Remove container ID for next attempt
        if (i < maxRetries - 1) {
          delete config.containerId;
        }
      }
    }

    throw lastError || new Error("Code execution failed after retries");
  }

  /**
   * Get tool definition for Claude API
   */
  getToolDefinition(): {
    type: string;
    name: string;
    description: string;
  } {
    return {
      type: "code_execution_20250825",
      name: "code_execution",
      description: "Execute Python 3.11.12 code in a secure isolated container. " +
        "Containers persist for 30 days allowing stateful execution. " +
        "5GB RAM and 5GB disk available. No internet access. " +
        "Perfect for data analysis, calculations, and automation tasks."
    };
  }

  /**
   * Format code execution result as string
   */
  static formatResult(result: CodeExecutionResult): string {
    const lines: string[] = [];

    if (result.stdout) {
      lines.push("=== OUTPUT ===");
      lines.push(result.stdout);
    }

    if (result.stderr) {
      lines.push("=== ERRORS ===");
      lines.push(result.stderr);
    }

    if (result.errorCode) {
      lines.push(`Error Code: ${result.errorCode}`);
    }

    lines.push(`Return Code: ${result.returnCode}`);

    if (result.containerId) {
      lines.push(`Container: ${result.containerId}`);
    }

    if (result.metadata) {
      lines.push(`Metadata: ${JSON.stringify(result.metadata, null, 2)}`);
    }

    return lines.join("\n");
  }

  /**
   * Create a reusable code execution session
   */
  async createSession(
    sessionName: string,
    setupCode?: string,
    files?: ContainerFile[]
  ): Promise<string> {
    // Execute setup code to create container
    const result = await this.execute(
      setupCode || "print('Session initialized')",
      { files }
    );

    if (!result.containerId) {
      throw new ToolExecutionError("Failed to create session: no container ID returned");
    }

    return result.containerId;
  }

  /**
   * Execute code in a named session
   */
  async executeInSession(
    sessionId: string,
    code: string
  ): Promise<CodeExecutionResult> {
    return this.execute(code, { containerId: sessionId });
  }

  /**
   * Get session statistics
   */
  getSessionStatistics(): {
    totalContainers: number;
    activeContainers: number;
    oldestContainer: Date | null;
    newestContainer: Date | null;
    averageAge: number;
  } {
    const containers = this.listContainers();
    const now = new Date();

    if (containers.length === 0) {
      return {
        totalContainers: 0,
        activeContainers: 0,
        oldestContainer: null,
        newestContainer: null,
        averageAge: 0
      };
    }

    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const activeContainers = containers.filter(
      c => c.lastUsed && c.lastUsed > oneHourAgo
    ).length;

    const ages = containers.map(c => now.getTime() - c.createdAt.getTime());
    const averageAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;

    const sortedByDate = [...containers].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    return {
      totalContainers: containers.length,
      activeContainers,
      oldestContainer: sortedByDate[0].createdAt,
      newestContainer: sortedByDate[sortedByDate.length - 1].createdAt,
      averageAge: averageAge / (1000 * 60 * 60 * 24) // Convert to days
    };
  }
}

/**
 * Example usage:
 *
 * const codeExec = new CodeExecutionTool({
 *   apiKey: process.env.ANTHROPIC_API_KEY!,
 *   containerLifetimeDays: 30,
 *   freeHoursPerDay: 50
 * });
 *
 * // Simple execution
 * const result = await codeExec.execute(`
 * import math
 * print(f"Pi is {math.pi}")
 * print(f"Square root of 2 is {math.sqrt(2)}")
 * `);
 *
 * console.log(CodeExecutionTool.formatResult(result));
 *
 * // Session-based execution
 * const sessionId = await codeExec.createSession(
 *   "data-analysis",
 *   "import pandas as pd\nimport numpy as np",
 *   [{ path: "data.csv", content: "name,value\nAlice,100\nBob,200" }]
 * );
 *
 * const analysisResult = await codeExec.executeInSession(
 *   sessionId,
 *   "df = pd.read_csv('data.csv')\nprint(df.describe())"
 * );
 *
 * // Use with streaming agent
 * class MyAgent extends StreamingAgent {
 *   private codeExec: CodeExecutionTool;
 *
 *   constructor(apiKey: string) {
 *     super(apiKey);
 *     this.codeExec = new CodeExecutionTool({ apiKey });
 *     this.setTools([this.codeExec.getToolDefinition()]);
 *   }
 *
 *   protected async executeTool(toolName: string, input: any): Promise<any> {
 *     if (toolName === "code_execution") {
 *       const result = await this.codeExec.execute(input.code, input);
 *       return CodeExecutionTool.formatResult(result);
 *     }
 *
 *     return super.executeTool(toolName, input);
 *   }
 * }
 */
