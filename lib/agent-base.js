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
   */
  getDefaultSystemPrompt() {
    return `You are ${this.name}, an AI agent specialized in ${this.type} operations.
You have access to various CLI tools and can execute commands across different platforms.
Platform: ${this.platform.platform}
Available shells: ${this.platform.availableShells.map(s => s.name).join(', ')}

Your goal is to help users accomplish their tasks efficiently and safely.`;
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
   * Cleanup resources
   */
  async cleanup() {
    // Override in subclass if needed
  }
}

module.exports = AgentBase;
