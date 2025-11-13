/**
 * Enterprise Configuration System
 *
 * Centralized configuration for all enterprise features including:
 * - Organization settings
 * - Cost management
 * - Security policies
 * - Tool configurations
 * - Agent definitions
 * - Streaming options
 * - Model pricing
 */

import {
  EnterpriseConfig,
  ModelPricing,
  BashToolConfig,
  TextEditorConfig,
  SecurityConfig
} from "../types";
import { ENTERPRISE_AGENTS } from "../agents/subagent-orchestrator";

/**
 * Default model pricing (as of January 2025)
 */
export const DEFAULT_MODEL_PRICING: ModelPricing = {
  "claude-sonnet-4-5": {
    inputTokenRate: 0.003 / 1000,      // $3 per million input tokens
    outputTokenRate: 0.015 / 1000,     // $15 per million output tokens
    cacheCreationRate: 0.00375 / 1000, // $3.75 per million cache creation tokens
    cacheReadRate: 0.0003 / 1000       // $0.30 per million cache read tokens
  },
  "claude-opus-4": {
    inputTokenRate: 0.015 / 1000,      // $15 per million input tokens
    outputTokenRate: 0.075 / 1000,     // $75 per million output tokens
    cacheCreationRate: 0.01875 / 1000, // $18.75 per million cache creation tokens
    cacheReadRate: 0.0015 / 1000       // $1.50 per million cache read tokens
  },
  "claude-haiku-4": {
    inputTokenRate: 0.0008 / 1000,     // $0.80 per million input tokens
    outputTokenRate: 0.004 / 1000,     // $4 per million output tokens
    cacheCreationRate: 0.001 / 1000,   // $1 per million cache creation tokens
    cacheReadRate: 0.00008 / 1000      // $0.08 per million cache read tokens
  }
};

/**
 * Default dangerous command patterns to block
 */
export const DEFAULT_COMMAND_BLOCKLIST: RegExp[] = [
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
  /nc\s+-l/,                     // Netcat listening
  /python.*-m\s+http\.server/,   // HTTP server
  /\/bin\/sh\s+-i/,              // Interactive shells
  /eval\(/,                      // Code evaluation
  /exec\(/                       // Code execution
];

/**
 * Default bash tool configuration
 */
export const DEFAULT_BASH_CONFIG: BashToolConfig = {
  timeout: 30000,                      // 30 seconds
  maxOutputSize: 1048576,              // 1 MB
  allowedCommands: [],                 // Empty = allow all except blocklist
  blockedPatterns: DEFAULT_COMMAND_BLOCKLIST,
  resourceLimits: {
    maxMemoryGB: 5,
    maxDiskGB: 5,
    maxCPUSeconds: 300,
    maxProcesses: 100
  },
  auditLogging: true
};

/**
 * Default text editor configuration
 */
export const DEFAULT_TEXT_EDITOR_CONFIG: TextEditorConfig = {
  backupEnabled: true,
  validateSyntax: true,
  maxFileSize: 10485760,              // 10 MB
  allowedDirectories: [process.cwd(), "/tmp"]
};

/**
 * Default security configuration
 */
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  isolation: "docker",
  commandBlocklist: DEFAULT_COMMAND_BLOCKLIST,
  resourceLimits: {
    maxMemoryGB: 5,
    maxDiskGB: 5,
    maxCPUSeconds: 300,
    maxProcesses: 100
  },
  auditLogging: {
    enabled: true,
    destination: "file",
    retentionDays: 90,
    includeCommandOutput: false        // Don't log output for privacy
  },
  pathValidation: true,
  networkIsolation: true
};

/**
 * Default enterprise configuration
 */
export const DEFAULT_ENTERPRISE_CONFIG: EnterpriseConfig = {
  organization: {
    id: "default-org",
    name: "Default Organization",
    tier: "pro"
  },

  cost: {
    orgBudget: 1000,                  // $1000 monthly budget
    userBudgetDefault: 100,           // $100 per user
    alertThresholds: [0.5, 0.75, 0.9, 0.95], // Alert at 50%, 75%, 90%, 95%
    billing: {
      email: "billing@example.com"
    }
  },

  security: DEFAULT_SECURITY_CONFIG,

  tools: {
    bash: {
      enabled: true,
      ...DEFAULT_BASH_CONFIG
    },
    codeExecution: {
      enabled: true,
      containerLifetimeDays: 30,
      freeHoursPerDay: 50              // 50 hours free compute per day
    },
    textEditor: {
      enabled: true,
      version: "text_editor_20250728",
      ...DEFAULT_TEXT_EDITOR_CONFIG
    }
  },

  agents: {
    enabled: true,
    definitions: ENTERPRISE_AGENTS,
    parallelization: {
      enabled: true,
      maxConcurrent: 5                // Max 5 parallel subagents
    }
  },

  streaming: {
    mode: "streaming",                // Default to streaming input mode
    fineGrainedEnabled: true,         // Enable fine-grained tool streaming
    maxTurns: 20,                     // Max agentic loop turns
    timeout: 300000                   // 5 minutes total timeout
  },

  models: {
    default: "claude-sonnet-4-5",
    allowUserOverride: true,
    pricing: DEFAULT_MODEL_PRICING
  }
};

/**
 * Configuration Manager - Load and validate configuration
 */
export class ConfigurationManager {
  private config: EnterpriseConfig;

  constructor(config?: Partial<EnterpriseConfig>) {
    this.config = this.mergeWithDefaults(config || {});
    this.validate();
  }

  /**
   * Merge user config with defaults
   */
  private mergeWithDefaults(
    userConfig: Partial<EnterpriseConfig>
  ): EnterpriseConfig {
    return {
      organization: {
        ...DEFAULT_ENTERPRISE_CONFIG.organization,
        ...userConfig.organization
      },
      cost: {
        ...DEFAULT_ENTERPRISE_CONFIG.cost,
        ...userConfig.cost
      },
      security: {
        ...DEFAULT_ENTERPRISE_CONFIG.security,
        ...userConfig.security
      },
      tools: {
        bash: {
          ...DEFAULT_ENTERPRISE_CONFIG.tools.bash,
          ...userConfig.tools?.bash
        },
        codeExecution: {
          ...DEFAULT_ENTERPRISE_CONFIG.tools.codeExecution,
          ...userConfig.tools?.codeExecution
        },
        textEditor: {
          ...DEFAULT_ENTERPRISE_CONFIG.tools.textEditor,
          ...userConfig.tools?.textEditor
        }
      },
      agents: {
        ...DEFAULT_ENTERPRISE_CONFIG.agents,
        ...userConfig.agents,
        definitions: {
          ...DEFAULT_ENTERPRISE_CONFIG.agents.definitions,
          ...userConfig.agents?.definitions
        }
      },
      streaming: {
        ...DEFAULT_ENTERPRISE_CONFIG.streaming,
        ...userConfig.streaming
      },
      models: {
        ...DEFAULT_ENTERPRISE_CONFIG.models,
        ...userConfig.models,
        pricing: {
          ...DEFAULT_ENTERPRISE_CONFIG.models.pricing,
          ...userConfig.models?.pricing
        }
      }
    };
  }

  /**
   * Validate configuration
   */
  private validate(): void {
    // Validate budget
    if (this.config.cost.orgBudget <= 0) {
      throw new Error("Organization budget must be positive");
    }

    if (this.config.cost.userBudgetDefault <= 0) {
      throw new Error("User budget default must be positive");
    }

    // Validate alert thresholds
    for (const threshold of this.config.cost.alertThresholds) {
      if (threshold <= 0 || threshold > 1) {
        throw new Error("Alert thresholds must be between 0 and 1");
      }
    }

    // Validate resource limits
    const limits = this.config.security.resourceLimits;
    if (limits.maxMemoryGB && limits.maxMemoryGB <= 0) {
      throw new Error("Max memory must be positive");
    }

    if (limits.maxDiskGB && limits.maxDiskGB <= 0) {
      throw new Error("Max disk must be positive");
    }

    // Validate streaming config
    if (this.config.streaming.maxTurns <= 0) {
      throw new Error("Max turns must be positive");
    }

    if (this.config.streaming.timeout <= 0) {
      throw new Error("Timeout must be positive");
    }
  }

  /**
   * Get configuration
   */
  getConfig(): EnterpriseConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<EnterpriseConfig>): void {
    this.config = this.mergeWithDefaults({
      ...this.config,
      ...updates
    });
    this.validate();
  }

  /**
   * Get organization ID
   */
  getOrgId(): string {
    return this.config.organization.id;
  }

  /**
   * Get organization tier
   */
  getOrgTier(): "free" | "pro" | "enterprise" {
    return this.config.organization.tier;
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: keyof EnterpriseConfig["tools"]): boolean {
    return this.config.tools[feature]?.enabled !== false;
  }

  /**
   * Get model pricing
   */
  getModelPricing(model: string): ModelPricing[string] | undefined {
    return this.config.models.pricing[model];
  }

  /**
   * Get default model
   */
  getDefaultModel(): string {
    return this.config.models.default;
  }

  /**
   * Get organization budget
   */
  getOrgBudget(): number {
    return this.config.cost.orgBudget;
  }

  /**
   * Get user budget default
   */
  getUserBudgetDefault(): number {
    return this.config.cost.userBudgetDefault;
  }

  /**
   * Get alert thresholds
   */
  getAlertThresholds(): number[] {
    return [...this.config.cost.alertThresholds];
  }

  /**
   * Get security config
   */
  getSecurityConfig(): SecurityConfig {
    return { ...this.config.security };
  }

  /**
   * Get bash config
   */
  getBashConfig(): BashToolConfig & { enabled: boolean } {
    return { ...this.config.tools.bash! };
  }

  /**
   * Get text editor config
   */
  getTextEditorConfig(): TextEditorConfig & { enabled: boolean; version: string } {
    return { ...this.config.tools.textEditor! };
  }

  /**
   * Export configuration as JSON
   */
  exportJSON(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  static fromJSON(json: string): ConfigurationManager {
    const config = JSON.parse(json);
    return new ConfigurationManager(config);
  }

  /**
   * Create configuration for specific tier
   */
  static forTier(tier: "free" | "pro" | "enterprise"): ConfigurationManager {
    const config = { ...DEFAULT_ENTERPRISE_CONFIG };

    switch (tier) {
      case "free":
        config.organization.tier = "free";
        config.cost.orgBudget = 100;
        config.cost.userBudgetDefault = 10;
        config.tools.codeExecution!.freeHoursPerDay = 10;
        config.agents.parallelization!.maxConcurrent = 2;
        break;

      case "pro":
        config.organization.tier = "pro";
        config.cost.orgBudget = 1000;
        config.cost.userBudgetDefault = 100;
        config.tools.codeExecution!.freeHoursPerDay = 50;
        config.agents.parallelization!.maxConcurrent = 5;
        break;

      case "enterprise":
        config.organization.tier = "enterprise";
        config.cost.orgBudget = 10000;
        config.cost.userBudgetDefault = 500;
        config.tools.codeExecution!.freeHoursPerDay = 200;
        config.agents.parallelization!.maxConcurrent = 10;
        break;
    }

    return new ConfigurationManager(config);
  }
}

/**
 * Example usage:
 *
 * // Use default configuration
 * const config = new ConfigurationManager();
 *
 * // Use custom configuration
 * const customConfig = new ConfigurationManager({
 *   organization: {
 *     id: "acme-corp",
 *     name: "Acme Corporation",
 *     tier: "enterprise"
 *   },
 *   cost: {
 *     orgBudget: 5000,
 *     userBudgetDefault: 200
 *   }
 * });
 *
 * // Create tier-specific configuration
 * const freeConfig = ConfigurationManager.forTier("free");
 * const proConfig = ConfigurationManager.forTier("pro");
 * const enterpriseConfig = ConfigurationManager.forTier("enterprise");
 *
 * // Check feature availability
 * if (config.isFeatureEnabled("bash")) {
 *   const bashConfig = config.getBashConfig();
 *   // Use bash tool
 * }
 *
 * // Export/import configuration
 * const json = config.exportJSON();
 * const imported = ConfigurationManager.fromJSON(json);
 */
