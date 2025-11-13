/**
 * Security Layer - Comprehensive Security and Audit System
 *
 * Features:
 * - Command validation and blocklisting
 * - Path validation and traversal prevention
 * - Resource limits enforcement
 * - Comprehensive audit logging
 * - Container/VM isolation support
 * - Secrets management integration
 */

import * as fs from "fs/promises";
import * as path from "path";
import {
  SecurityConfig,
  AuditLogEntry,
  SecurityError,
  ResourceLimits
} from "../types";

/**
 * Security Manager - Central security enforcement
 */
export class SecurityManager {
  private config: SecurityConfig;
  private auditLog: AuditLogEntry[] = [];

  constructor(config: SecurityConfig) {
    this.config = config;
  }

  /**
   * Validate a command against security policies
   */
  validateCommand(command: string): void {
    // Check blocklist patterns
    for (const pattern of this.config.commandBlocklist) {
      if (pattern.test(command)) {
        const error = new SecurityError(
          `Command blocked by security policy: matches dangerous pattern ${pattern.toString()}`
        );

        this.logSecurityEvent({
          command,
          error: error.message,
          tool: "command_validator"
        });

        throw error;
      }
    }
  }

  /**
   * Validate a file path for security
   */
  validatePath(filePath: string, allowedDirectories?: string[]): void {
    // Check for path traversal attempts
    if (filePath.includes("..")) {
      throw new SecurityError("Path traversal not allowed");
    }

    // Resolve to absolute path
    const resolved = path.resolve(filePath);

    // Check against allowed directories
    const allowed = allowedDirectories || [process.cwd(), "/tmp"];
    const isAllowed = allowed.some(dir => {
      const allowedDir = path.resolve(dir);
      return resolved.startsWith(allowedDir);
    });

    if (!isAllowed) {
      throw new SecurityError(
        `Path not in allowed directories: ${filePath}\n` +
          `Allowed: ${allowed.join(", ")}`
      );
    }

    // Check for sensitive paths
    const sensitivePaths = [
      "/etc/passwd",
      "/etc/shadow",
      "/root",
      "~/.ssh",
      "~/.aws",
      "~/.config"
    ];

    for (const sensitivePath of sensitivePaths) {
      if (resolved.includes(sensitivePath)) {
        throw new SecurityError(
          `Access to sensitive path denied: ${sensitivePath}`
        );
      }
    }
  }

  /**
   * Sanitize user input
   */
  sanitizeInput(input: string): string {
    // Remove null bytes
    let sanitized = input.replace(/\0/g, "");

    // Remove control characters except newlines and tabs
    sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");

    return sanitized;
  }

  /**
   * Validate resource limits
   */
  validateResourceLimits(
    requested: Partial<ResourceLimits>
  ): ResourceLimits {
    const limits = this.config.resourceLimits;

    return {
      maxMemoryGB: Math.min(
        requested.maxMemoryGB || limits.maxMemoryGB || 5,
        limits.maxMemoryGB || 5
      ),
      maxDiskGB: Math.min(
        requested.maxDiskGB || limits.maxDiskGB || 5,
        limits.maxDiskGB || 5
      ),
      maxCPUSeconds: Math.min(
        requested.maxCPUSeconds || limits.maxCPUSeconds || 300,
        limits.maxCPUSeconds || 300
      ),
      maxProcesses: Math.min(
        requested.maxProcesses || limits.maxProcesses || 100,
        limits.maxProcesses || 100
      )
    };
  }

  /**
   * Log security event
   */
  private logSecurityEvent(entry: Partial<AuditLogEntry>): void {
    if (!this.config.auditLogging.enabled) {
      return;
    }

    const logEntry: AuditLogEntry = {
      timestamp: new Date(),
      tool: entry.tool || "unknown",
      userId: entry.userId,
      command: entry.command,
      result: entry.result,
      error: entry.error,
      duration: entry.duration
    };

    this.auditLog.push(logEntry);

    // Write to destination
    this.writeAuditLog(logEntry);
  }

  /**
   * Write audit log to destination
   */
  private async writeAuditLog(entry: AuditLogEntry): Promise<void> {
    const destination = this.config.auditLogging.destination;

    switch (destination) {
      case "file":
        await this.writeAuditLogFile(entry);
        break;

      case "syslog":
        // Implement syslog integration
        console.log("AUDIT:", JSON.stringify(entry));
        break;

      case "cloudwatch":
        // Implement CloudWatch integration
        console.log("AUDIT:", JSON.stringify(entry));
        break;

      default:
        console.log("AUDIT:", JSON.stringify(entry));
    }
  }

  /**
   * Write audit log to file
   */
  private async writeAuditLogFile(entry: AuditLogEntry): Promise<void> {
    const logDir = path.join(process.cwd(), "logs");
    const logFile = path.join(logDir, "audit.log");

    try {
      // Create logs directory if needed
      await fs.mkdir(logDir, { recursive: true });

      // Append to log file
      const logLine =
        JSON.stringify({
          ...entry,
          timestamp: entry.timestamp.toISOString()
        }) + "\n";

      await fs.appendFile(logFile, logLine);
    } catch (error) {
      console.error("Failed to write audit log:", error);
    }
  }

  /**
   * Get audit log
   */
  getAuditLog(): AuditLogEntry[] {
    return [...this.auditLog];
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.auditLog = [];
  }

  /**
   * Export audit log for compliance reporting
   */
  exportAuditLog(
    startDate?: Date,
    endDate?: Date
  ): AuditLogEntry[] {
    let filtered = this.auditLog;

    if (startDate) {
      filtered = filtered.filter(
        entry => entry.timestamp >= startDate
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        entry => entry.timestamp <= endDate
      );
    }

    return filtered;
  }

  /**
   * Check if file contains secrets
   */
  async containsSecrets(filePath: string): Promise<boolean> {
    const content = await fs.readFile(filePath, "utf-8");

    // Patterns for common secrets
    const secretPatterns = [
      /api[_-]?key[s]?\s*[:=]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/i,
      /secret[_-]?key[s]?\s*[:=]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/i,
      /password[s]?\s*[:=]\s*['"]?[^\s'"]{8,}['"]?/i,
      /token[s]?\s*[:=]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/i,
      /private[_-]?key/i,
      /AKIA[0-9A-Z]{16}/,  // AWS access key
      /-----BEGIN RSA PRIVATE KEY-----/,
      /-----BEGIN PRIVATE KEY-----/,
      /ghp_[a-zA-Z0-9]{36}/,  // GitHub personal access token
      /sk_live_[a-zA-Z0-9]{24,}/,  // Stripe secret key
    ];

    for (const pattern of secretPatterns) {
      if (pattern.test(content)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Redact secrets from text
   */
  redactSecrets(text: string): string {
    let redacted = text;

    // Redact common secret patterns
    const redactionPatterns = [
      { pattern: /api[_-]?key[s]?\s*[:=]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi, replacement: "api_key: [REDACTED]" },
      { pattern: /secret[_-]?key[s]?\s*[:=]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi, replacement: "secret_key: [REDACTED]" },
      { pattern: /password[s]?\s*[:=]\s*['"]?([^\s'"]{8,})['"]?/gi, replacement: "password: [REDACTED]" },
      { pattern: /token[s]?\s*[:=]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/gi, replacement: "token: [REDACTED]" },
      { pattern: /AKIA[0-9A-Z]{16}/g, replacement: "AKIA[REDACTED]" },
      { pattern: /ghp_[a-zA-Z0-9]{36}/g, replacement: "ghp_[REDACTED]" },
      { pattern: /sk_live_[a-zA-Z0-9]{24,}/g, replacement: "sk_live_[REDACTED]" },
    ];

    for (const { pattern, replacement } of redactionPatterns) {
      redacted = redacted.replace(pattern, replacement);
    }

    return redacted;
  }

  /**
   * Log tool execution
   */
  async logToolExecution(
    tool: string,
    command: string,
    userId?: string,
    result?: string,
    error?: string,
    duration?: number
  ): Promise<void> {
    this.logSecurityEvent({
      tool,
      command: this.redactSecrets(command),
      userId,
      result: result ? this.redactSecrets(result) : undefined,
      error: error ? this.redactSecrets(error) : undefined,
      duration
    });
  }
}

/**
 * Isolation Manager - Manage container/VM isolation
 */
export class IsolationManager {
  private mode: "docker" | "vm" | "none";

  constructor(mode: "docker" | "vm" | "none" = "docker") {
    this.mode = mode;
  }

  /**
   * Check if isolation is enabled
   */
  isEnabled(): boolean {
    return this.mode !== "none";
  }

  /**
   * Get isolation mode
   */
  getMode(): "docker" | "vm" | "none" {
    return this.mode;
  }

  /**
   * Create isolated environment
   */
  async createEnvironment(config: {
    image?: string;
    resourceLimits: ResourceLimits;
  }): Promise<string> {
    if (this.mode === "docker") {
      return this.createDockerContainer(config);
    }

    if (this.mode === "vm") {
      return this.createVM(config);
    }

    throw new Error("Isolation not enabled");
  }

  /**
   * Create Docker container
   */
  private async createDockerContainer(config: {
    image?: string;
    resourceLimits: ResourceLimits;
  }): Promise<string> {
    // This is a placeholder - implement actual Docker integration
    const containerId = `docker-${Date.now()}`;

    console.log("Creating Docker container:", {
      id: containerId,
      image: config.image || "ubuntu:22.04",
      limits: config.resourceLimits
    });

    return containerId;
  }

  /**
   * Create VM
   */
  private async createVM(config: {
    resourceLimits: ResourceLimits;
  }): Promise<string> {
    // This is a placeholder - implement actual VM integration
    const vmId = `vm-${Date.now()}`;

    console.log("Creating VM:", {
      id: vmId,
      limits: config.resourceLimits
    });

    return vmId;
  }

  /**
   * Destroy isolated environment
   */
  async destroyEnvironment(environmentId: string): Promise<void> {
    console.log("Destroying environment:", environmentId);
    // Implement cleanup logic
  }
}

/**
 * Example usage:
 *
 * const securityManager = new SecurityManager({
 *   isolation: "docker",
 *   commandBlocklist: [
 *     /rm\s+-rf\s+\//,
 *     /sudo/,
 *     /wget/
 *   ],
 *   resourceLimits: {
 *     maxMemoryGB: 5,
 *     maxDiskGB: 5,
 *     maxCPUSeconds: 300,
 *     maxProcesses: 100
 *   },
 *   auditLogging: {
 *     enabled: true,
 *     destination: "file",
 *     retentionDays: 90
 *   }
 * });
 *
 * // Validate command
 * try {
 *   securityManager.validateCommand("ls -la");
 *   securityManager.validatePath("/tmp/myfile.txt");
 * } catch (error) {
 *   console.error("Security violation:", error.message);
 * }
 *
 * // Check for secrets
 * const hasSecrets = await securityManager.containsSecrets("config.env");
 * if (hasSecrets) {
 *   console.warn("File contains secrets!");
 * }
 *
 * // Redact secrets from output
 * const safeOutput = securityManager.redactSecrets(output);
 *
 * // Export audit log
 * const auditLog = securityManager.exportAuditLog(
 *   new Date("2024-01-01"),
 *   new Date("2024-12-31")
 * );
 */
