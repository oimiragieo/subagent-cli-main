/**
 * Enterprise AI Agent CLI Framework - Type Definitions
 * Shared types and interfaces for all components
 */

import Anthropic from "@anthropic-ai/sdk";

// ============================================================================
// Message Types
// ============================================================================

export interface UserMessage {
  role: "user";
  content: string | ContentBlock[];
}

export interface AssistantMessage {
  role: "assistant";
  content: ContentBlock[];
  id?: string;
  model?: string;
  stop_reason?: string;
  usage?: Usage;
}

export type Message = UserMessage | AssistantMessage;

export interface ContentBlock {
  type: string;
  text?: string;
  tool_use_id?: string;
  content?: string;
  name?: string;
  input?: any;
}

export interface Usage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

// ============================================================================
// Streaming Types
// ============================================================================

export interface StreamingConfig {
  model?: string;
  maxTokens?: number;
  allowedTools?: string[];
  maxTurns?: number;
  betas?: string[];
  systemPrompt?: string;
  temperature?: number;
}

export interface AgentMessage {
  type: "assistant" | "tool_result" | "thinking" | "text" | "error";
  id?: string;
  model?: string;
  content: ContentBlock[];
  usage?: Usage;
  stop_reason?: string;
  timestamp?: Date;
}

export interface StreamEvent {
  type: string;
  delta?: any;
  content_block?: any;
  message?: any;
  usage?: Usage;
}

// ============================================================================
// Cost Tracking Types
// ============================================================================

export interface ModelPricing {
  [model: string]: {
    inputTokenRate: number;      // Cost per input token (USD)
    outputTokenRate: number;     // Cost per output token (USD)
    cacheCreationRate: number;   // Cost per cache creation token (USD)
    cacheReadRate: number;       // Cost per cache read token (USD)
  };
}

export interface StepUsage {
  messageId: string;
  timestamp: Date;
  usage: Usage;
  costUsd: number;
  userId?: string;
  projectId?: string;
  agentName?: string;
}

export interface TrackingContext {
  userId?: string;
  projectId?: string;
  agentName?: string;
  sessionId?: string;
}

export interface CostSummary {
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheCreationTokens: number;
  totalCacheReadTokens: number;
  messageCount: number;
  byUser?: { [userId: string]: number };
  byProject?: { [projectId: string]: number };
  byAgent?: { [agentName: string]: number };
}

export interface BudgetAlert {
  threshold: number;
  totalCost: number;
  orgBudget: number;
  percentUsed: number;
  timestamp: Date;
}

// ============================================================================
// Todo Tracking Types
// ============================================================================

export interface Todo {
  id: string;
  content: string;           // Imperative form: "Run tests"
  activeForm: string;        // Present continuous: "Running tests"
  status: "pending" | "in_progress" | "completed";
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface TodoProgress {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  percentComplete: number;
}

export type TodoListener = (todos: Todo[]) => void;

// ============================================================================
// Tool Types
// ============================================================================

export interface ToolDefinition {
  type?: string;
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: { [key: string]: any };
    required?: string[];
  };
}

export interface ToolResult {
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

// ============================================================================
// Bash Tool Types
// ============================================================================

export interface BashToolConfig {
  timeout?: number;                // Timeout in milliseconds
  maxOutputSize?: number;          // Max output size in bytes
  allowedCommands?: string[];      // Whitelist of allowed commands
  blockedPatterns?: RegExp[];      // Blocklist of dangerous patterns
  resourceLimits?: ResourceLimits;
  auditLogging?: boolean;
}

export interface ResourceLimits {
  maxMemoryGB?: number;
  maxDiskGB?: number;
  maxCPUSeconds?: number;
  maxProcesses?: number;
}

export interface BashSession {
  id: string;
  createdAt: Date;
  lastUsed: Date;
  environment: { [key: string]: string };
  workingDirectory: string;
}

export interface BashExecuteOptions {
  sessionId?: string;
  userId?: string;
  workingDirectory?: string;
  environment?: { [key: string]: string };
  timeout?: number;
}

export interface BashResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
  sessionId: string;
}

// ============================================================================
// Code Execution Types
// ============================================================================

export interface CodeExecutionConfig {
  language?: string;
  containerId?: string;
  files?: ContainerFile[];
  timeout?: number;
  userId?: string;
}

export interface ContainerFile {
  path: string;
  content: string;
}

export interface Container {
  id: string;
  createdAt: Date;
  files: ContainerFile[];
  lastUsed?: Date;
}

export interface CodeExecutionResult {
  stdout: string;
  stderr: string;
  returnCode: number;
  metadata?: any;
  errorCode?: string;
  containerId?: string;
}

// ============================================================================
// Text Editor Types
// ============================================================================

export interface TextEditorConfig {
  backupEnabled?: boolean;
  validateSyntax?: boolean;
  maxFileSize?: number;
  allowedDirectories?: string[];
}

export interface FileBackup {
  path: string;
  content: string;
  timestamp: Date;
}

export interface EditOperation {
  type: "str_replace" | "insert" | "create" | "view" | "undo_edit";
  path?: string;
  oldContent?: string;
  newContent?: string;
  timestamp: Date;
}

export interface ReplaceResult {
  path: string;
  matchCount: number;
  replacedText: string;
  newText: string;
  success: boolean;
}

// ============================================================================
// Subagent Types
// ============================================================================

export interface AgentDefinition {
  description: string;
  prompt: string;
  tools?: string[];
  model?: "sonnet" | "opus" | "haiku";
  maxTurns?: number;
}

export interface AgentDefinitions {
  [agentName: string]: AgentDefinition;
}

export interface SubagentTask {
  agent: string;
  task: string;
  options?: ExecutionOptions;
}

export interface SubagentExecution {
  agent: string;
  task: string;
  startTime: Date;
  endTime?: Date;
  status: "running" | "completed" | "failed";
  result?: any;
  error?: string;
}

export interface SubagentResult {
  agent: string;
  task: string;
  result: string;
  usage?: Usage;
  duration: number;
}

export interface ExecutionOptions {
  allowedTools?: string[];
  model?: string;
  maxTurns?: number;
  userId?: string;
  projectId?: string;
}

// ============================================================================
// Security Types
// ============================================================================

export interface SecurityConfig {
  isolation: "docker" | "vm" | "none";
  commandBlocklist: RegExp[];
  resourceLimits: ResourceLimits;
  auditLogging: AuditLoggingConfig;
  pathValidation?: boolean;
  networkIsolation?: boolean;
}

export interface AuditLoggingConfig {
  enabled: boolean;
  destination: "file" | "syslog" | "cloudwatch";
  retentionDays: number;
  includeCommandOutput?: boolean;
}

export interface AuditLogEntry {
  timestamp: Date;
  userId?: string;
  tool: string;
  command?: string;
  result?: string;
  error?: string;
  duration?: number;
}

// ============================================================================
// Enterprise Configuration Types
// ============================================================================

export interface EnterpriseConfig {
  organization: {
    id: string;
    name: string;
    tier: "free" | "pro" | "enterprise";
  };
  cost: {
    orgBudget: number;
    userBudgetDefault: number;
    alertThresholds: number[];
    billing: {
      email: string;
    };
  };
  security: SecurityConfig;
  tools: {
    bash?: BashToolConfig & { enabled: boolean };
    codeExecution?: {
      enabled: boolean;
      containerLifetimeDays: number;
      freeHoursPerDay: number;
    };
    textEditor?: TextEditorConfig & {
      enabled: boolean;
      version: string;
    };
  };
  agents: {
    enabled: boolean;
    definitions: AgentDefinitions;
    parallelization?: {
      enabled: boolean;
      maxConcurrent: number;
    };
  };
  streaming: {
    mode: "streaming" | "single";
    fineGrainedEnabled: boolean;
    maxTurns: number;
    timeout: number;
  };
  models: {
    default: string;
    allowUserOverride: boolean;
    pricing: ModelPricing;
  };
}

// ============================================================================
// Error Types
// ============================================================================

export class BudgetExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BudgetExceededError";
  }
}

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityError";
  }
}

export class EditorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EditorError";
  }
}

export class ToolExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolExecutionError";
  }
}
