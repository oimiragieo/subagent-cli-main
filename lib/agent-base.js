/**
 * Agent Base Class
 * Base class for all AI agents with common functionality
 */

const PlatformDetector = require('./platform-detector');
const ToolExecutor = require('./tool-executor');
const fs = require('fs').promises;
const path = require('path');

class AgentBase {
  constructor(config = {}) {
    this.name = config.name || 'BaseAgent';
    this.type = config.type || 'general';
    this.platform = new PlatformDetector();
    this.executor = new ToolExecutor(config.executorConfig || {});
    this.config = config;
    this.systemPrompt = '';
    this.tools = new Map();
    this.conversationHistory = [];
    this.metadata = {
      created: Date.now(),
      version: '1.0.0',
      ...config.metadata
    };
  }

  /**
   * Initialize the agent
   */
  async initialize() {
    await this.loadSystemPrompt();
    await this.loadToolRegistry();
    await this.detectAvailableTools();
    await this.onInitialize();
  }

  /**
   * Hook for subclass initialization
   */
  async onInitialize() {
    // Override in subclass
  }

  /**
   * Load system prompt from file
   */
  async loadSystemPrompt() {
    try {
      const promptPath = path.join(__dirname, '..', 'prompts', `${this.type}.md`);
      this.systemPrompt = await fs.readFile(promptPath, 'utf8');
    } catch (error) {
      console.warn(`Could not load system prompt for ${this.type}: ${error.message}`);
      this.systemPrompt = this.getDefaultSystemPrompt();
    }
  }

  /**
   * Get default system prompt
   * Enhanced with parallel tool use instruction per Claude best practices
   */
  getDefaultSystemPrompt() {
    return `You are ${this.name}, an AI agent specialized in ${this.type} operations.
You have access to various CLI tools and can execute commands across different platforms.
Platform: ${this.platform.platform}
Available shells: ${this.platform.availableShells.map(s => s.name).join(', ')}

Your goal is to help users accomplish their tasks efficiently and safely.

## Tool Use Best Practices

For maximum efficiency, whenever performing multiple independent operations, invoke all relevant tools simultaneously rather than sequentially. If a user request requires multiple tool calls that don't depend on each other's results, make all calls in parallel within a single assistant message.

When using tools:
1. Read tool descriptions carefully to understand their purpose and limitations
2. Provide all required parameters with appropriate values
3. Handle errors gracefully and provide clear feedback
4. Consider whether operations can be parallelized for better performance`;
  }

  /**
   * Load tool registry
   */
  async loadToolRegistry() {
    try {
      const registryPath = path.join(__dirname, '..', 'tools', 'registry.json');
      const registry = JSON.parse(await fs.readFile(registryPath, 'utf8'));

      // Load tools relevant to this agent type
      const relevantTools = registry.tools.filter(tool =>
        tool.agents.includes(this.type) || tool.agents.includes('*')
      );

      relevantTools.forEach(tool => {
        this.tools.set(tool.name, tool);
      });
    } catch (error) {
      console.warn(`Could not load tool registry: ${error.message}`);
    }
  }

  /**
   * Detect which tools are actually available on the system
   */
  async detectAvailableTools() {
    const detectionPromises = [];

    for (const [name, tool] of this.tools) {
      detectionPromises.push(
        this.executor.isToolAvailable(tool.command || name).then(available => {
          tool.available = available;
          if (available && tool.versionCommand) {
            return this.executor.getToolVersion(name, tool.versionCommand).then(version => {
              tool.version = version;
            });
          }
        })
      );
    }

    await Promise.all(detectionPromises);
  }

  /**
   * Execute a task
   * @param {string} task Task description
   * @param {Object} options Execution options
   * @returns {Promise<Object>} Task result
   */
  async execute(task, options = {}) {
    this.conversationHistory.push({
      role: 'user',
      content: task,
      timestamp: Date.now()
    });

    try {
      // Plan the task
      const plan = await this.planTask(task, options);

      // Execute the plan
      const result = await this.executePlan(plan, options);

      // Post-process result
      const processedResult = await this.postProcess(result, options);

      this.conversationHistory.push({
        role: 'assistant',
        content: processedResult.summary,
        timestamp: Date.now(),
        metadata: processedResult.metadata
      });

      return processedResult;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error.message,
        task,
        timestamp: Date.now()
      };

      this.conversationHistory.push({
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: Date.now(),
        error: true
      });

      return errorResult;
    }
  }

  /**
   * Plan a task into executable steps
   * @param {string} task Task description
   * @param {Object} options Planning options
   * @returns {Promise<Object>} Task plan
   */
  async planTask(task, options = {}) {
    // This is a placeholder - in a real implementation, this would use
    // an LLM API to generate a plan based on the system prompt and available tools

    return {
      task,
      steps: [],
      estimatedDuration: 0,
      requiredTools: [],
      platform: this.platform.platform
    };
  }

  /**
   * Execute a plan
   * @param {Object} plan Task plan
   * @param {Object} options Execution options
   * @returns {Promise<Object>} Execution result
   */
  async executePlan(plan, options = {}) {
    const results = [];

    for (const step of plan.steps) {
      const stepResult = await this.executeStep(step, options);
      results.push(stepResult);

      if (!stepResult.success && options.stopOnError !== false) {
        break;
      }
    }

    return {
      plan,
      results,
      success: results.every(r => r.success),
      timestamp: Date.now()
    };
  }

  /**
   * Execute a single step
   * @param {Object} step Step to execute
   * @param {Object} options Execution options
   * @returns {Promise<Object>} Step result
   */
  async executeStep(step, options = {}) {
    if (step.type === 'command') {
      return this.executor.execute(step.command, options);
    } else if (step.type === 'script') {
      return this.executeScript(step.script, options);
    } else {
      throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  /**
   * Execute a script
   * @param {string} script Script content
   * @param {Object} options Execution options
   * @returns {Promise<Object>} Execution result
   */
  async executeScript(script, options = {}) {
    // Write script to temp file and execute
    const tempFile = path.join(
      this.platform.getPlatformInfo().tmpDir,
      `agent_script_${Date.now()}.${this.getScriptExtension()}`
    );

    await fs.writeFile(tempFile, script);

    try {
      const result = await this.executor.execute(
        this.getScriptExecuteCommand(tempFile),
        options
      );
      return result;
    } finally {
      await fs.unlink(tempFile).catch(() => {});
    }
  }

  /**
   * Get script file extension for platform
   */
  getScriptExtension() {
    if (this.platform.isWindows()) {
      return 'ps1';
    } else {
      return 'sh';
    }
  }

  /**
   * Get command to execute a script file
   */
  getScriptExecuteCommand(scriptPath) {
    if (this.platform.isWindows()) {
      return `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`;
    } else {
      return `bash "${scriptPath}"`;
    }
  }

  /**
   * Post-process execution result
   * @param {Object} result Execution result
   * @param {Object} options Post-processing options
   * @returns {Promise<Object>} Processed result
   */
  async postProcess(result, options = {}) {
    return {
      ...result,
      summary: this.generateSummary(result),
      metadata: {
        agent: this.name,
        type: this.type,
        platform: this.platform.platform,
        ...result.metadata
      }
    };
  }

  /**
   * Generate summary of results
   * @param {Object} result Execution result
   * @returns {string} Summary
   */
  generateSummary(result) {
    if (result.success) {
      return `Task completed successfully. Executed ${result.results?.length || 0} steps.`;
    } else {
      return `Task failed. Error: ${result.error || 'Unknown error'}`;
    }
  }

  /**
   * Get available tools
   * @returns {Array<Object>} Available tools
   */
  getAvailableTools() {
    return Array.from(this.tools.values()).filter(tool => tool.available);
  }

  /**
   * Get tool by name
   * @param {string} name Tool name
   * @returns {Object|null} Tool object or null
   */
  getTool(name) {
    return this.tools.get(name) || null;
  }

  /**
   * Check if tool is available
   * @param {string} name Tool name
   * @returns {boolean} True if available
   */
  isToolAvailable(name) {
    const tool = this.tools.get(name);
    return tool ? tool.available : false;
  }

  /**
   * Get agent information
   * @returns {Object} Agent information
   */
  getInfo() {
    return {
      name: this.name,
      type: this.type,
      platform: this.platform.platform,
      availableTools: this.getAvailableTools().map(t => ({
        name: t.name,
        version: t.version,
        description: t.description
      })),
      metadata: this.metadata,
      stats: this.executor.getStats()
    };
  }

  /**
   * Get conversation history
   * @param {number} limit Number of messages to return
   * @returns {Array<Object>} Conversation history
   */
  getHistory(limit = 10) {
    return this.conversationHistory.slice(-limit);
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Export agent state
   * @returns {Object} Agent state
   */
  export() {
    return {
      name: this.name,
      type: this.type,
      platform: this.platform.platform,
      conversationHistory: this.conversationHistory,
      metadata: this.metadata,
      stats: this.executor.getStats()
    };
  }

  /**
   * Register a Claude tool with validation
   * Follows Claude's tool use best practices
   * @param {Object} tool Tool definition
   */
  registerClaudeTool(tool) {
    // Validate tool definition
    const validation = this.validateToolDefinition(tool);
    if (!validation.valid) {
      throw new Error(`Invalid tool definition: ${validation.errors.join(', ')}`);
    }

    // Warn if description is too short
    if (tool.description.length < 200) {
      console.warn(
        `[${this.name}] Tool '${tool.name}' has short description (${tool.description.length} chars). ` +
        `Claude recommends 3-4 sentences minimum (200+ chars) for optimal performance.`
      );
    }

    // Store tool
    this.tools.set(tool.name, tool);
  }

  /**
   * Validate tool definition per Claude requirements
   * @param {Object} tool Tool definition
   * @returns {Object} Validation result with errors array
   */
  validateToolDefinition(tool) {
    const errors = [];

    // Check required fields
    if (!tool.name) errors.push('Tool must have a name');
    if (!tool.description) errors.push('Tool must have a description');
    if (!tool.input_schema) errors.push('Tool must have an input_schema');

    // Validate name format (Claude requirement: ^[a-zA-Z0-9_-]{1,64}$)
    if (tool.name && !/^[a-zA-Z0-9_-]{1,64}$/.test(tool.name)) {
      errors.push('Tool name must match pattern ^[a-zA-Z0-9_-]{1,64}$');
    }

    // Check description length
    if (tool.description && tool.description.length < 100) {
      errors.push(
        `Tool description is very short (${tool.description.length} chars). ` +
        `Recommend at least 100 characters for clarity.`
      );
    }

    // Validate input schema
    if (tool.input_schema) {
      if (tool.input_schema.type !== 'object') {
        errors.push('input_schema type must be "object"');
      }
      if (!tool.input_schema.properties) {
        errors.push('input_schema must have properties');
      }

      // Check parameter descriptions
      if (tool.input_schema.properties) {
        Object.keys(tool.input_schema.properties).forEach(paramName => {
          const param = tool.input_schema.properties[paramName];
          if (!param.description || param.description.length < 10) {
            errors.push(
              `Parameter '${paramName}' needs a clear description (min 10 chars)`
            );
          }
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Execute tools in parallel with proper error handling
   * Follows Claude's parallel tool use pattern
   * @param {Array} toolUseBlocks Array of tool_use blocks from Claude
   * @returns {Promise<Array>} Array of tool_result blocks
   */
  async executeToolsParallel(toolUseBlocks) {
    // Filter to only tool_use blocks
    const tools = toolUseBlocks.filter(block => block.type === 'tool_use');

    // Execute all tools concurrently
    const results = await Promise.all(
      tools.map(async (toolBlock) => {
        try {
          // Execute the tool
          const result = await this.executeClaudeTool(
            toolBlock.name,
            toolBlock.input
          );

          // Return successful tool_result
          return {
            type: 'tool_result',
            tool_use_id: toolBlock.id,
            content: typeof result === 'string' ? result : JSON.stringify(result)
          };
        } catch (error) {
          // Return error tool_result with is_error: true
          return {
            type: 'tool_result',
            tool_use_id: toolBlock.id,
            content: `${error.name}: ${error.message}`,
            is_error: true
          };
        }
      })
    );

    return results;
  }

  /**
   * Execute a single Claude tool
   * Override in subclass to implement actual tool execution
   * @param {string} toolName Name of the tool to execute
   * @param {Object} toolInput Input parameters for the tool
   * @returns {Promise<any>} Tool execution result
   */
  async executeClaudeTool(toolName, toolInput) {
    // Default implementation - override in subclass
    throw new Error(
      `Tool execution not implemented: ${toolName}. ` +
      `Override executeClaudeTool() in ${this.constructor.name}`
    );
  }

  /**
   * Execute agent with Claude API integration
   * Implements proper tool execution loop per Claude best practices
   * @param {string} userMessage User's message/request
   * @param {Object} options Execution options
   * @returns {Promise<Object>} Response with tool execution details
   */
  async executeWithClaude(userMessage, options = {}) {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    });

    // Configuration
    const maxIterations = options.maxToolIterations || 10;
    const model = options.model || 'claude-sonnet-4-5';
    const maxTokens = options.maxTokens || 2048;
    const toolChoice = options.toolChoice || { type: 'auto' };

    let iteration = 0;
    const executionLog = [];

    // Tool execution loop
    while (iteration < maxIterations) {
      iteration++;

      // Prepare Claude API request (pseudo-code - actual implementation would use Anthropic SDK)
      const request = {
        model,
        max_tokens: maxTokens,
        system: this.systemPrompt,
        tools: Array.from(this.tools.values()),
        tool_choice: toolChoice,
        messages: this.conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      };

      executionLog.push({
        iteration,
        type: 'request',
        timestamp: Date.now()
      });

      // Simulate Claude API call (in real implementation, use actual API)
      // const response = await this.claude.messages.create(request);

      // For now, return a structured response showing the pattern
      const response = {
        stop_reason: iteration === 1 ? 'tool_use' : 'end_turn',
        content: iteration === 1
          ? [
              {
                type: 'tool_use',
                id: 'toolu_01ABC',
                name: 'example_tool',
                input: { param: 'value' }
              }
            ]
          : [
              {
                type: 'text',
                text: 'Based on the tool results, here is the answer...'
              }
            ]
      };

      executionLog.push({
        iteration,
        type: 'response',
        stop_reason: response.stop_reason,
        timestamp: Date.now()
      });

      // Handle response based on stop_reason
      if (response.stop_reason === 'tool_use') {
        // Add assistant message with tool use
        this.conversationHistory.push({
          role: 'assistant',
          content: response.content,
          timestamp: Date.now()
        });

        // Execute all tools in parallel
        const toolResults = await this.executeToolsParallel(response.content);

        executionLog.push({
          iteration,
          type: 'tool_execution',
          toolCount: toolResults.length,
          timestamp: Date.now()
        });

        // CRITICAL: Add all tool results in SINGLE user message
        this.conversationHistory.push({
          role: 'user',
          content: toolResults,
          timestamp: Date.now()
        });

        // Continue loop for next iteration
        continue;

      } else {
        // Done - final response received
        executionLog.push({
          iteration,
          type: 'completion',
          timestamp: Date.now()
        });

        return {
          success: true,
          content: response.content,
          stop_reason: response.stop_reason,
          iterations: iteration,
          executionLog,
          conversationHistory: this.conversationHistory
        };
      }
    }

    // Max iterations exceeded
    throw new Error(
      `Max tool iterations (${maxIterations}) exceeded. ` +
      `Tool execution loop did not converge.`
    );
  }

  /**
   * Format tool results for Claude API
   * Ensures proper formatting per Claude requirements
   * @param {Array} toolResults Array of tool execution results
   * @returns {Array} Formatted tool_result blocks
   */
  formatToolResults(toolResults) {
    return toolResults.map(result => ({
      type: 'tool_result',
      tool_use_id: result.tool_use_id,
      content: result.content,
      ...(result.is_error && { is_error: true })
    }));
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    // Override in subclass if needed
  }
}

module.exports = AgentBase;
