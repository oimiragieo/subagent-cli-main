/**
 * Tool Executor
 * Executes CLI tools across different platforms with proper error handling
 */

const { spawn, exec } = require('child_process');
const PlatformDetector = require('./platform-detector');

class ToolExecutor {
  constructor(config = {}) {
    this.platform = new PlatformDetector();
    this.config = {
      timeout: config.timeout || 300000, // 5 minutes default
      maxBuffer: config.maxBuffer || 10 * 1024 * 1024, // 10MB
      shell: config.shell || this.platform.getDefaultShell().name,
      encoding: config.encoding || 'utf8',
      ...config
    };
    this.executionHistory = [];
  }

  /**
   * Execute a command
   * @param {string} command Command to execute
   * @param {Object} options Execution options
   * @returns {Promise<Object>} Execution result
   */
  async execute(command, options = {}) {
    const executionOptions = {
      shell: options.shell || this.config.shell,
      timeout: options.timeout || this.config.timeout,
      maxBuffer: options.maxBuffer || this.config.maxBuffer,
      cwd: options.cwd || process.cwd(),
      env: options.env || process.env,
      encoding: options.encoding || this.config.encoding
    };

    const startTime = Date.now();
    const executionId = this.generateExecutionId();

    try {
      const result = await this.executeCommand(command, executionOptions);
      const endTime = Date.now();

      const execution = {
        id: executionId,
        command,
        shell: executionOptions.shell,
        platform: this.platform.platform,
        startTime,
        endTime,
        duration: endTime - startTime,
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
        error: result.error,
        success: result.exitCode === 0
      };

      this.executionHistory.push(execution);
      return execution;
    } catch (error) {
      const endTime = Date.now();

      const execution = {
        id: executionId,
        command,
        shell: executionOptions.shell,
        platform: this.platform.platform,
        startTime,
        endTime,
        duration: endTime - startTime,
        exitCode: error.code || -1,
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        error: error.message,
        success: false
      };

      this.executionHistory.push(execution);
      return execution;
    }
  }

  /**
   * Execute command using child_process
   * @param {string} command Command to execute
   * @param {Object} options Execution options
   * @returns {Promise<Object>} Execution result
   */
  executeCommand(command, options) {
    return new Promise((resolve, reject) => {
      exec(command, options, (error, stdout, stderr) => {
        if (error) {
          error.stdout = stdout;
          error.stderr = stderr;
          reject(error);
        } else {
          resolve({
            exitCode: 0,
            stdout: stdout.toString(),
            stderr: stderr.toString()
          });
        }
      });
    });
  }

  /**
   * Execute command with streaming output
   * @param {string} command Command to execute
   * @param {Object} options Execution options
   * @param {Function} onData Callback for stdout data
   * @param {Function} onError Callback for stderr data
   * @returns {Promise<Object>} Execution result
   */
  async executeStreaming(command, options = {}, onData = null, onError = null) {
    const executionOptions = {
      shell: options.shell || this.config.shell,
      cwd: options.cwd || process.cwd(),
      env: options.env || process.env
    };

    return new Promise((resolve, reject) => {
      const child = spawn(command, [], executionOptions);

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        if (onData) onData(text);
      });

      child.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        if (onError) onError(text);
      });

      child.on('close', (code) => {
        resolve({
          exitCode: code,
          stdout,
          stderr,
          success: code === 0
        });
      });

      child.on('error', (error) => {
        reject(error);
      });

      if (options.timeout) {
        setTimeout(() => {
          child.kill();
          reject(new Error(`Command timed out after ${options.timeout}ms`));
        }, options.timeout);
      }
    });
  }

  /**
   * Execute PowerShell command
   * @param {string} command PowerShell command
   * @param {Object} options Execution options
   * @returns {Promise<Object>} Execution result
   */
  async executePowerShell(command, options = {}) {
    const shell = this.platform.getShellByName('pwsh') || this.platform.getShellByName('powershell');

    if (!shell) {
      throw new Error('PowerShell is not available on this system');
    }

    const psCommand = `${shell.name} -NoProfile -NonInteractive -Command "${command.replace(/"/g, '\\"')}"`;
    return this.execute(psCommand, { ...options, shell: shell.name });
  }

  /**
   * Execute Bash command
   * @param {string} command Bash command
   * @param {Object} options Execution options
   * @returns {Promise<Object>} Execution result
   */
  async executeBash(command, options = {}) {
    const shell = this.platform.getShellByName('bash');

    if (!shell) {
      throw new Error('Bash is not available on this system');
    }

    return this.execute(command, { ...options, shell: 'bash' });
  }

  /**
   * Execute command based on platform
   * @param {string} windowsCommand Command for Windows
   * @param {string} unixCommand Command for Unix/Linux/macOS
   * @param {Object} options Execution options
   * @returns {Promise<Object>} Execution result
   */
  async executeCrossPlatform(windowsCommand, unixCommand, options = {}) {
    const command = this.platform.isWindows() ? windowsCommand : unixCommand;
    return this.execute(command, options);
  }

  /**
   * Check if a tool is available
   * @param {string} toolName Tool name
   * @returns {Promise<boolean>} True if tool is available
   */
  async isToolAvailable(toolName) {
    try {
      const command = this.platform.isWindows()
        ? `where ${toolName}`
        : `which ${toolName}`;

      const result = await this.execute(command);
      return result.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get tool version
   * @param {string} toolName Tool name
   * @param {string} versionFlag Version flag (default: --version)
   * @returns {Promise<string>} Tool version
   */
  async getToolVersion(toolName, versionFlag = '--version') {
    try {
      const result = await this.execute(`${toolName} ${versionFlag}`);
      return result.stdout.trim().split('\n')[0];
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Execute multiple commands in sequence
   * @param {Array<string>} commands Commands to execute
   * @param {Object} options Execution options
   * @returns {Promise<Array<Object>>} Array of execution results
   */
  async executeSequence(commands, options = {}) {
    const results = [];

    for (const command of commands) {
      const result = await this.execute(command, options);
      results.push(result);

      // Stop on first failure if stopOnError is true
      if (!result.success && options.stopOnError) {
        break;
      }
    }

    return results;
  }

  /**
   * Execute multiple commands in parallel
   * @param {Array<string>} commands Commands to execute
   * @param {Object} options Execution options
   * @returns {Promise<Array<Object>>} Array of execution results
   */
  async executeParallel(commands, options = {}) {
    const promises = commands.map(command => this.execute(command, options));
    return Promise.all(promises);
  }

  /**
   * Get execution history
   * @param {number} limit Number of recent executions to return
   * @returns {Array<Object>} Execution history
   */
  getHistory(limit = 10) {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Clear execution history
   */
  clearHistory() {
    this.executionHistory = [];
  }

  /**
   * Generate unique execution ID
   * @returns {string} Execution ID
   */
  generateExecutionId() {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get tool executor statistics
   * @returns {Object} Statistics
   */
  getStats() {
    const total = this.executionHistory.length;
    const successful = this.executionHistory.filter(e => e.success).length;
    const failed = total - successful;
    const avgDuration = total > 0
      ? this.executionHistory.reduce((sum, e) => sum + e.duration, 0) / total
      : 0;

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      avgDuration: Math.round(avgDuration),
      platform: this.platform.platform,
      defaultShell: this.config.shell
    };
  }
}

module.exports = ToolExecutor;
