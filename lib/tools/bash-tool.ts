/**
 * Bash Tool - Persistent Bash Sessions with Security
 *
 * Features:
 * - Persistent bash sessions with environment state
 * - Command blocklist for dangerous operations
 * - Resource limits (CPU, memory, disk)
 * - Comprehensive audit logging
 * - Timeout management
 * - Output size limits
 */

import { exec, spawn } from "child_process";
import { promisify } from "util";
import {
  BashToolConfig,
  BashSession,
  BashExecuteOptions,
  BashResult,
  ResourceLimits,
  SecurityError,
  ToolExecutionError
} from "../types";

const execAsync = promisify(exec);

export class BashTool {
  private sessions: Map<string, BashSession> = new Map();
  private config: Required<BashToolConfig>;
  private auditLog: Array<{
    timestamp: Date;
    sessionId: string;
    command: string;
    userId?: string;
    result?: BashResult;
    error?: string;
  }> = [];

  constructor(config: BashToolConfig = {}) {
    this.config = {
      timeout: config.timeout || 30000,
      maxOutputSize: config.maxOutputSize || 1048576,
      allowedCommands: config.allowedCommands || [],
      blockedPatterns: config.blockedPatterns || this.getDefaultBlockedPatterns(),
      resourceLimits: config.resourceLimits || this.getDefaultResourceLimits(),
      auditLogging: config.auditLogging !== false
    };
  }

  /**
   * Get default blocked patterns for dangerous commands
   */
  private getDefaultBlockedPatterns(): RegExp[] {
    return [
      /rm\s+-rf\s+\//,              // Dangerous deletions (rm -rf /)
      /curl.*http:\/\//,             // External HTTP requests
      /wget.*/,                      // External downloads
      /sudo/,                        // Privilege escalation
      /chmod\s+777/,                 // Insecure permissions
      /mkfs/,                        // Filesystem formatting
      /dd\s+if=/,                    // Disk operations
      />\/dev\/sd[a-z]/,             // Direct disk writes
      /:(){ :|:& };:/,               // Fork bomb
      /shutdown/,                    // System shutdown
      /reboot/,                      // System reboot
      /init\s+0/,                    // System halt
      /killall/,                     // Kill all processes
      /pkill.*-9/,                   // Force kill processes
    ];
  }

  /**
   * Get default resource limits
   */
  private getDefaultResourceLimits(): ResourceLimits {
    return {
      maxMemoryGB: 5,
      maxDiskGB: 5,
      maxCPUSeconds: 300,
      maxProcesses: 100
    };
  }

  /**
   * Validate command against blocklist
   */
  private validateCommand(command: string): void {
    // Check blocked patterns
    for (const pattern of this.config.blockedPatterns) {
      if (pattern.test(command)) {
        throw new SecurityError(
          `Command blocked by security policy: matches pattern ${pattern.toString()}`
        );
      }
    }

    // Check allowed commands (if whitelist is set)
    if (this.config.allowedCommands.length > 0) {
      const commandName = command.trim().split(/\s+/)[0];
      const isAllowed = this.config.allowedCommands.some(allowed =>
        commandName === allowed || command.startsWith(allowed + " ")
      );

      if (!isAllowed) {
        throw new SecurityError(
          `Command not in allowed list: ${commandName}`
        );
      }
    }
  }

  /**
   * Get or create a bash session
   */
  private getSession(sessionId: string): BashSession {
    let session = this.sessions.get(sessionId);

    if (!session) {
      session = {
        id: sessionId,
        createdAt: new Date(),
        lastUsed: new Date(),
        environment: { ...process.env },
        workingDirectory: process.cwd()
      };

      this.sessions.set(sessionId, session);
    }

    session.lastUsed = new Date();
    return session;
  }

  /**
   * Execute a bash command
   */
  async execute(
    command: string,
    options: BashExecuteOptions = {}
  ): Promise<BashResult> {
    const startTime = Date.now();
    const sessionId = options.sessionId || "default";

    try {
      // Validate command
      this.validateCommand(command);

      // Get session
      const session = this.getSession(sessionId);

      // Update session state if provided
      if (options.workingDirectory) {
        session.workingDirectory = options.workingDirectory;
      }

      if (options.environment) {
        session.environment = { ...session.environment, ...options.environment };
      }

      // Build command with resource limits
      const wrappedCommand = this.wrapCommandWithLimits(command);

      // Execute command
      const execOptions = {
        timeout: options.timeout || this.config.timeout,
        maxBuffer: this.config.maxOutputSize,
        cwd: session.workingDirectory,
        env: session.environment,
        shell: "/bin/bash"
      };

      const { stdout, stderr } = await execAsync(wrappedCommand, execOptions);

      const result: BashResult = {
        stdout: this.truncateOutput(stdout),
        stderr: this.truncateOutput(stderr),
        exitCode: 0,
        duration: Date.now() - startTime,
        sessionId
      };

      // Audit log
      if (this.config.auditLogging) {
        this.auditLog.push({
          timestamp: new Date(),
          sessionId,
          command,
          userId: options.userId,
          result
        });
      }

      return result;
    } catch (error: any) {
      const errorResult: BashResult = {
        stdout: "",
        stderr: error.stderr || error.message,
        exitCode: error.code || 1,
        duration: Date.now() - startTime,
        sessionId
      };

      // Audit log
      if (this.config.auditLogging) {
        this.auditLog.push({
          timestamp: new Date(),
          sessionId,
          command,
          userId: options.userId,
          error: error.message
        });
      }

      if (error instanceof SecurityError) {
        throw error;
      }

      throw new ToolExecutionError(
        `Bash command failed: ${error.message}\n${error.stderr || ""}`
      );
    }
  }

  /**
   * Wrap command with resource limits using ulimit
   */
  private wrapCommandWithLimits(command: string): string {
    const limits = this.config.resourceLimits;
    const ulimitCommands: string[] = [];

    if (limits.maxCPUSeconds) {
      ulimitCommands.push(`ulimit -t ${limits.maxCPUSeconds}`);
    }

    if (limits.maxMemoryGB) {
      const memoryKB = limits.maxMemoryGB * 1024 * 1024;
      ulimitCommands.push(`ulimit -v ${memoryKB}`);
    }

    if (limits.maxProcesses) {
      ulimitCommands.push(`ulimit -u ${limits.maxProcesses}`);
    }

    if (limits.maxDiskGB) {
      const diskKB = limits.maxDiskGB * 1024 * 1024;
      ulimitCommands.push(`ulimit -f ${diskKB}`);
    }

    if (ulimitCommands.length === 0) {
      return command;
    }

    return `${ulimitCommands.join("; ")}; ${command}`;
  }

  /**
   * Truncate output if it exceeds max size
   */
  private truncateOutput(output: string): string {
    if (output.length > this.config.maxOutputSize) {
      const truncated = output.substring(0, this.config.maxOutputSize);
      const remaining = output.length - this.config.maxOutputSize;
      return `${truncated}\n\n... [truncated ${remaining} bytes]`;
    }

    return output;
  }

  /**
   * Get session information
   */
  getSession(sessionId: string): BashSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * List all sessions
   */
  listSessions(): BashSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Clear all sessions
   */
  clearSessions(): void {
    this.sessions.clear();
  }

  /**
   * Get audit log
   */
  getAuditLog(): typeof this.auditLog {
    return [...this.auditLog];
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.auditLog = [];
  }

  /**
   * Get tool definition for Claude API
   */
  getToolDefinition(): {
    type: string;
    name: string;
    description: string;
    input_schema: any;
  } {
    return {
      type: "bash_20250124",
      name: "bash",
      description: "Execute bash commands in a persistent session. " +
        "Environment variables and working directory persist across calls. " +
        "Use for file operations, system administration, and automation tasks.",
      input_schema: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description: "The bash command to execute"
          },
          sessionId: {
            type: "string",
            description: "Session ID to use (optional, defaults to 'default')"
          },
          workingDirectory: {
            type: "string",
            description: "Working directory for command execution (optional)"
          },
          environment: {
            type: "object",
            description: "Environment variables to set (optional)",
            additionalProperties: {
              type: "string"
            }
          }
        },
        required: ["command"]
      }
    };
  }

  /**
   * Format bash result as string
   */
  static formatResult(result: BashResult): string {
    const lines: string[] = [];

    if (result.stdout) {
      lines.push("=== STDOUT ===");
      lines.push(result.stdout);
    }

    if (result.stderr) {
      lines.push("=== STDERR ===");
      lines.push(result.stderr);
    }

    lines.push(`Exit Code: ${result.exitCode}`);
    lines.push(`Duration: ${result.duration}ms`);
    lines.push(`Session: ${result.sessionId}`);

    return lines.join("\n");
  }
}

/**
 * Example usage:
 *
 * const bashTool = new BashTool({
 *   timeout: 30000,
 *   maxOutputSize: 1048576,
 *   blockedPatterns: [/rm\s+-rf\s+\//, /sudo/],
 *   resourceLimits: {
 *     maxMemoryGB: 5,
 *     maxDiskGB: 5,
 *     maxCPUSeconds: 300,
 *     maxProcesses: 100
 *   },
 *   auditLogging: true
 * });
 *
 * // Execute command
 * const result = await bashTool.execute("ls -la", {
 *   sessionId: "user123",
 *   userId: "user123"
 * });
 *
 * console.log(BashTool.formatResult(result));
 *
 * // Use with streaming agent
 * class MyAgent extends StreamingAgent {
 *   private bashTool: BashTool;
 *
 *   constructor(apiKey: string) {
 *     super(apiKey);
 *     this.bashTool = new BashTool();
 *     this.setTools([this.bashTool.getToolDefinition()]);
 *   }
 *
 *   protected async executeTool(toolName: string, input: any): Promise<any> {
 *     if (toolName === "bash") {
 *       const result = await this.bashTool.execute(input.command, input);
 *       return BashTool.formatResult(result);
 *     }
 *
 *     return super.executeTool(toolName, input);
 *   }
 * }
 */
