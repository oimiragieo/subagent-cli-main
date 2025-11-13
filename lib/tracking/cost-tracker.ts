/**
 * Cost Tracker - Real-time Usage and Budget Management
 *
 * Features:
 * - Message ID deduplication to prevent double-charging
 * - Per-user and per-project cost attribution
 * - Budget threshold alerts (50%, 75%, 90%, 95%)
 * - Hard budget enforcement
 * - Real-time cost calculation with cache awareness
 * - Comprehensive usage reporting
 */

import {
  Usage,
  ModelPricing,
  StepUsage,
  TrackingContext,
  CostSummary,
  BudgetAlert,
  BudgetExceededError,
  AgentMessage
} from "../types";

export class CostTracker {
  private processedMessageIds: Set<string> = new Set();
  private stepUsages: StepUsage[] = [];
  private modelPricing: ModelPricing;
  private orgBudget: number;
  private alertThresholds: number[];
  private alertedThresholds: Set<number> = new Set();
  private alertCallback?: (alert: BudgetAlert) => Promise<void>;

  constructor(config: {
    modelPricing: ModelPricing;
    orgBudget: number;
    alertThresholds?: number[];
    alertCallback?: (alert: BudgetAlert) => Promise<void>;
  }) {
    this.modelPricing = config.modelPricing;
    this.orgBudget = config.orgBudget;
    this.alertThresholds = config.alertThresholds || [0.5, 0.75, 0.9, 0.95];
    this.alertCallback = config.alertCallback;

    // Sort thresholds in ascending order
    this.alertThresholds.sort((a, b) => a - b);
  }

  /**
   * Track usage from an agent message
   * CRITICAL: Call this for every assistant message to track costs
   */
  async onMessage(
    message: AgentMessage,
    context?: TrackingContext
  ): Promise<void> {
    // Only track assistant messages with usage data
    if (message.type !== "assistant" || !message.usage) {
      return;
    }

    // CRITICAL: Deduplicate by message ID to prevent double-charging
    if (message.id && this.processedMessageIds.has(message.id)) {
      return;
    }

    if (message.id) {
      this.processedMessageIds.add(message.id);
    }

    // Calculate cost for this message
    const cost = this.calculateCost(message.usage, message.model || "claude-sonnet-4-5");

    // Record step usage
    const stepUsage: StepUsage = {
      messageId: message.id || `unknown-${Date.now()}`,
      timestamp: message.timestamp || new Date(),
      usage: message.usage,
      costUsd: cost,
      userId: context?.userId,
      projectId: context?.projectId,
      agentName: context?.agentName
    };

    this.stepUsages.push(stepUsage);

    // Check budget thresholds
    await this.checkBudgetThresholds();
  }

  /**
   * Calculate cost for a usage record
   */
  private calculateCost(usage: Usage, model: string): number {
    const pricing = this.modelPricing[model];

    if (!pricing) {
      console.warn(`No pricing found for model: ${model}, using default`);
      return 0;
    }

    const inputCost = usage.input_tokens * pricing.inputTokenRate;
    const outputCost = usage.output_tokens * pricing.outputTokenRate;
    const cacheCreationCost = (usage.cache_creation_input_tokens || 0) * pricing.cacheCreationRate;
    const cacheReadCost = (usage.cache_read_input_tokens || 0) * pricing.cacheReadRate;

    return inputCost + outputCost + cacheCreationCost + cacheReadCost;
  }

  /**
   * Check budget thresholds and send alerts
   */
  private async checkBudgetThresholds(): Promise<void> {
    const totalCost = this.getTotalCost();
    const percentUsed = totalCost / this.orgBudget;

    // Check each threshold
    for (const threshold of this.alertThresholds) {
      if (percentUsed >= threshold && !this.alertedThresholds.has(threshold)) {
        const alert: BudgetAlert = {
          threshold,
          totalCost,
          orgBudget: this.orgBudget,
          percentUsed: percentUsed * 100,
          timestamp: new Date()
        };

        // Send alert
        if (this.alertCallback) {
          await this.alertCallback(alert);
        }

        // Mark threshold as alerted
        this.alertedThresholds.add(threshold);
      }
    }

    // Hard budget enforcement
    if (percentUsed >= 1.0) {
      throw new BudgetExceededError(
        `Organization budget exceeded: $${totalCost.toFixed(2)} / $${this.orgBudget}`
      );
    }
  }

  /**
   * Get total cost across all messages
   */
  getTotalCost(): number {
    return this.stepUsages.reduce((sum, usage) => sum + usage.costUsd, 0);
  }

  /**
   * Get total input tokens
   */
  getTotalInputTokens(): number {
    return this.stepUsages.reduce(
      (sum, usage) => sum + usage.usage.input_tokens,
      0
    );
  }

  /**
   * Get total output tokens
   */
  getTotalOutputTokens(): number {
    return this.stepUsages.reduce(
      (sum, usage) => sum + usage.usage.output_tokens,
      0
    );
  }

  /**
   * Get total cache creation tokens
   */
  getTotalCacheCreationTokens(): number {
    return this.stepUsages.reduce(
      (sum, usage) => sum + (usage.usage.cache_creation_input_tokens || 0),
      0
    );
  }

  /**
   * Get total cache read tokens
   */
  getTotalCacheReadTokens(): number {
    return this.stepUsages.reduce(
      (sum, usage) => sum + (usage.usage.cache_read_input_tokens || 0),
      0
    );
  }

  /**
   * Get cost summary
   */
  getSummary(): CostSummary {
    const byUser: { [userId: string]: number } = {};
    const byProject: { [projectId: string]: number } = {};
    const byAgent: { [agentName: string]: number } = {};

    for (const usage of this.stepUsages) {
      // Aggregate by user
      if (usage.userId) {
        byUser[usage.userId] = (byUser[usage.userId] || 0) + usage.costUsd;
      }

      // Aggregate by project
      if (usage.projectId) {
        byProject[usage.projectId] = (byProject[usage.projectId] || 0) + usage.costUsd;
      }

      // Aggregate by agent
      if (usage.agentName) {
        byAgent[usage.agentName] = (byAgent[usage.agentName] || 0) + usage.costUsd;
      }
    }

    return {
      totalCost: this.getTotalCost(),
      totalInputTokens: this.getTotalInputTokens(),
      totalOutputTokens: this.getTotalOutputTokens(),
      totalCacheCreationTokens: this.getTotalCacheCreationTokens(),
      totalCacheReadTokens: this.getTotalCacheReadTokens(),
      messageCount: this.stepUsages.length,
      byUser,
      byProject,
      byAgent
    };
  }

  /**
   * Get cost for a specific user
   */
  getUserCost(userId: string): number {
    return this.stepUsages
      .filter(usage => usage.userId === userId)
      .reduce((sum, usage) => sum + usage.costUsd, 0);
  }

  /**
   * Get cost for a specific project
   */
  getProjectCost(projectId: string): number {
    return this.stepUsages
      .filter(usage => usage.projectId === projectId)
      .reduce((sum, usage) => sum + usage.costUsd, 0);
  }

  /**
   * Get cost for a specific agent
   */
  getAgentCost(agentName: string): number {
    return this.stepUsages
      .filter(usage => usage.agentName === agentName)
      .reduce((sum, usage) => sum + usage.costUsd, 0);
  }

  /**
   * Get remaining budget
   */
  getRemainingBudget(): number {
    return Math.max(0, this.orgBudget - this.getTotalCost());
  }

  /**
   * Get budget usage percentage
   */
  getBudgetUsagePercent(): number {
    return (this.getTotalCost() / this.orgBudget) * 100;
  }

  /**
   * Export usage data for reporting
   */
  exportUsageData(): StepUsage[] {
    return [...this.stepUsages];
  }

  /**
   * Clear all usage data (use with caution!)
   */
  clear(): void {
    this.processedMessageIds.clear();
    this.stepUsages = [];
    this.alertedThresholds.clear();
  }

  /**
   * Reset alert thresholds (allows re-alerting)
   */
  resetAlerts(): void {
    this.alertedThresholds.clear();
  }

  /**
   * Format cost as USD string
   */
  static formatCost(cost: number): string {
    return `$${cost.toFixed(4)}`;
  }

  /**
   * Format budget alert message
   */
  static formatAlert(alert: BudgetAlert): string {
    return (
      `⚠️  Budget Alert: ${alert.percentUsed.toFixed(1)}% used\n` +
      `   Total Cost: $${alert.totalCost.toFixed(2)} / $${alert.orgBudget}\n` +
      `   Threshold: ${(alert.threshold * 100).toFixed(0)}%\n` +
      `   Timestamp: ${alert.timestamp.toISOString()}`
    );
  }

  /**
   * Format cost summary as text
   */
  static formatSummary(summary: CostSummary): string {
    const lines: string[] = [];

    lines.push("━━━ Cost Summary ━━━");
    lines.push(`Total Cost: $${summary.totalCost.toFixed(4)}`);
    lines.push(`Messages: ${summary.messageCount}`);
    lines.push("");
    lines.push("Token Usage:");
    lines.push(`  Input: ${summary.totalInputTokens.toLocaleString()}`);
    lines.push(`  Output: ${summary.totalOutputTokens.toLocaleString()}`);

    if (summary.totalCacheCreationTokens > 0) {
      lines.push(`  Cache Creation: ${summary.totalCacheCreationTokens.toLocaleString()}`);
    }

    if (summary.totalCacheReadTokens > 0) {
      lines.push(`  Cache Read: ${summary.totalCacheReadTokens.toLocaleString()}`);
    }

    if (summary.byUser && Object.keys(summary.byUser).length > 0) {
      lines.push("");
      lines.push("By User:");
      for (const [userId, cost] of Object.entries(summary.byUser)) {
        lines.push(`  ${userId}: $${cost.toFixed(4)}`);
      }
    }

    if (summary.byProject && Object.keys(summary.byProject).length > 0) {
      lines.push("");
      lines.push("By Project:");
      for (const [projectId, cost] of Object.entries(summary.byProject)) {
        lines.push(`  ${projectId}: $${cost.toFixed(4)}`);
      }
    }

    if (summary.byAgent && Object.keys(summary.byAgent).length > 0) {
      lines.push("");
      lines.push("By Agent:");
      for (const [agentName, cost] of Object.entries(summary.byAgent)) {
        lines.push(`  ${agentName}: $${cost.toFixed(4)}`);
      }
    }

    return lines.join("\n");
  }
}

/**
 * Example usage:
 *
 * const costTracker = new CostTracker({
 *   modelPricing: {
 *     "claude-sonnet-4-5": {
 *       inputTokenRate: 0.003 / 1000,
 *       outputTokenRate: 0.015 / 1000,
 *       cacheCreationRate: 0.00375 / 1000,
 *       cacheReadRate: 0.0003 / 1000
 *     }
 *   },
 *   orgBudget: 1000,
 *   alertThresholds: [0.5, 0.75, 0.9, 0.95],
 *   alertCallback: async (alert) => {
 *     console.log(CostTracker.formatAlert(alert));
 *     // Send email, Slack notification, etc.
 *   }
 * });
 *
 * // Track usage from streaming agent
 * for await (const message of agent.query(userMessages())) {
 *   await costTracker.onMessage(message, {
 *     userId: "user123",
 *     projectId: "project456",
 *     agentName: "devops"
 *   });
 * }
 *
 * // Get summary
 * const summary = costTracker.getSummary();
 * console.log(CostTracker.formatSummary(summary));
 */
