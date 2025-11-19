# Enterprise AI Agent Implementation - Complete Guide

## Overview

This document describes the complete implementation of enterprise-grade Claude AI agent features based on official Anthropic documentation. All components follow Claude best practices and are production-ready.

## 🎯 Implemented Features

### ✅ Core Infrastructure

1. **Streaming Architecture** (`lib/streaming/streaming-agent.ts`)
   - Fine-grained tool streaming (3s vs 15s latency improvement)
   - Streaming input mode for interactive scenarios
   - Automatic agentic loop with tool execution
   - Message history management
   - Usage tracking integration

2. **Cost Tracking System** (`lib/tracking/cost-tracker.ts`)
   - Message ID deduplication (prevents double-charging)
   - Real-time budget enforcement
   - Multi-threshold alerts (50%, 75%, 90%, 95%)
   - Per-user and per-project cost attribution
   - Cache-aware cost calculation

3. **Todo Tracking System** (`lib/tracking/todo-tracker.ts`)
   - Automatic progress visualization
   - Task status tracking (pending, in_progress, completed)
   - Duration tracking and estimates
   - Rich console output with icons

### ✅ Built-in Tools

4. **Bash Tool** (`lib/tools/bash-tool.ts`)
   - Persistent bash sessions with environment state
   - Command blocklist for dangerous operations
   - Resource limits (CPU, memory, disk, processes)
   - Comprehensive audit logging
   - Timeout and output size management

5. **Code Execution Tool** (`lib/tools/code-execution-tool.ts`)
   - Python 3.11.12 in isolated containers
   - Container reuse for stateful sessions (30-day lifetime)
   - File persistence across executions
   - Network isolation (no internet access)
   - 5GB RAM, 5GB disk limits

6. **Text Editor Tool** (`lib/tools/text-editor-tool.ts`)
   - str_replace with uniqueness validation
   - File creation with directory auto-creation
   - Line-based insertion
   - View with line numbers
   - Undo/redo support
   - Automatic backups
   - Syntax validation

### ✅ Advanced Features

7. **Subagent Orchestration** (`lib/agents/subagent-orchestrator.ts`)
   - 6 specialized enterprise agents:
     - **security-auditor**: OWASP, compliance, vulnerability assessment
     - **test-engineer**: TDD, coverage, integration/unit tests
     - **documentation-writer**: README, API docs, diagrams
     - **performance-optimizer**: Algorithm, database, caching
     - **code-reviewer**: Quality, patterns, SOLID principles
     - **data-analyst**: Statistical analysis, visualizations
   - Parallel and sequential execution
   - Isolated agent contexts
   - Usage tracking per agent

8. **Prompt Engineering Templates** (`lib/prompts/prompt-templates.ts`)
   - Chain of Thought (CoT) prompting
   - XML-structured prompts
   - Pre-built templates for:
     - Security audits
     - Debugging
     - Code review
     - Optimization
     - Test generation
     - Documentation
     - API design
     - SQL optimization
     - Incident response

9. **Security Layer** (`lib/security/security-layer.ts`)
   - Command validation and blocklisting
   - Path traversal prevention
   - Resource limits enforcement
   - Secrets detection and redaction
   - Comprehensive audit logging
   - Container/VM isolation support

10. **Enterprise Configuration** (`lib/config/enterprise-config.ts`)
    - Centralized configuration management
    - Tier-based presets (free, pro, enterprise)
    - Model pricing configuration
    - Budget and alert thresholds
    - Security policies
    - Tool configurations
    - JSON import/export

### ✅ Type System

11. **Comprehensive Types** (`lib/types/index.ts`)
    - All TypeScript interfaces and types
    - Error classes
    - Shared type definitions
    - Full type safety

## 📁 Project Structure

```
lib/
├── streaming/
│   └── streaming-agent.ts          # Streaming architecture with fine-grained support
├── tracking/
│   ├── cost-tracker.ts              # Cost tracking with deduplication
│   └── todo-tracker.ts              # Todo tracking infrastructure
├── tools/
│   ├── bash-tool.ts                 # Bash execution with security
│   ├── code-execution-tool.ts       # Python code execution in containers
│   └── text-editor-tool.ts          # File manipulation tools
├── agents/
│   └── subagent-orchestrator.ts     # Specialized subagent management
├── prompts/
│   └── prompt-templates.ts          # CoT and XML prompt templates
├── security/
│   └── security-layer.ts            # Security and audit system
├── config/
│   └── enterprise-config.ts         # Enterprise configuration
└── types/
    └── index.ts                     # Shared type definitions
```

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build
```

### Basic Usage

```typescript
import { StreamingAgent } from "./lib/streaming/streaming-agent";
import { CostTracker } from "./lib/tracking/cost-tracker";
import { BashTool } from "./lib/tools/bash-tool";
import { ConfigurationManager } from "./lib/config/enterprise-config";

// Initialize configuration
const config = new ConfigurationManager();

// Create streaming agent
const agent = new StreamingAgent(
  process.env.ANTHROPIC_API_KEY!,
  "You are a helpful AI assistant.",
);

// Setup cost tracking
const costTracker = new CostTracker({
  modelPricing: config.getConfig().models.pricing,
  orgBudget: config.getOrgBudget(),
  alertThresholds: config.getAlertThresholds(),
  alertCallback: async (alert) => {
    console.log(CostTracker.formatAlert(alert));
  },
});

// Setup bash tool
const bashTool = new BashTool(config.getBashConfig());
agent.addTool(bashTool.getToolDefinition());

// Execute query
async function* userMessages() {
  yield { role: "user", content: "List files in current directory" };
}

for await (const message of agent.query(userMessages())) {
  // Track costs
  await costTracker.onMessage(message);

  // Display output
  if (message.type === "text") {
    process.stdout.write(message.content[0].text);
  }
}

// Show cost summary
console.log(CostTracker.formatSummary(costTracker.getSummary()));
```

### Using Subagents

```typescript
import { SubagentOrchestrator } from "./lib/agents/subagent-orchestrator";

const orchestrator = new SubagentOrchestrator({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Security audit
const securityResult = await orchestrator.executeWithSubagent(
  "security-auditor",
  "Audit this authentication code for vulnerabilities:\n" + code,
);

console.log(securityResult.result);

// Parallel execution
const results = await orchestrator.executeParallel([
  { agent: "security-auditor", task: "Audit authentication code" },
  { agent: "test-engineer", task: "Write unit tests" },
  { agent: "documentation-writer", task: "Document API" },
]);
```

### Using Prompt Templates

```typescript
import {
  ChainOfThoughtPrompt,
  PromptTemplates,
} from "./lib/prompts/prompt-templates";

// Security audit with Chain of Thought
const auditPrompt = ChainOfThoughtPrompt.createSecurityAudit(code);
const result = await agent.querySingle(auditPrompt);

// Generate tests
const testPrompt = PromptTemplates.testGeneration(code, "jest");
const tests = await agent.querySingle(testPrompt);

// Code review
const reviewPrompt = ChainOfThoughtPrompt.createCodeReview(code);
const review = await agent.querySingle(reviewPrompt);
```

## 🔧 Configuration

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=your_api_key_here

# Optional
LOG_LEVEL=info
AUDIT_LOG_DESTINATION=file
```

### Configuration File

Create `config/config.json`:

```json
{
  "organization": {
    "id": "acme-corp",
    "name": "Acme Corporation",
    "tier": "enterprise"
  },
  "cost": {
    "orgBudget": 5000,
    "userBudgetDefault": 200,
    "alertThresholds": [0.5, 0.75, 0.9, 0.95]
  },
  "security": {
    "isolation": "docker",
    "auditLogging": {
      "enabled": true,
      "destination": "file",
      "retentionDays": 90
    }
  },
  "streaming": {
    "mode": "streaming",
    "fineGrainedEnabled": true,
    "maxTurns": 20
  }
}
```

Load configuration:

```typescript
import { ConfigurationManager } from "./lib/config/enterprise-config";
import * as fs from "fs";

const configJson = fs.readFileSync("config/config.json", "utf-8");
const config = ConfigurationManager.fromJSON(configJson);
```

## 📊 Cost Management

### Budget Enforcement

```typescript
const costTracker = new CostTracker({
  modelPricing: {
    "claude-sonnet-4-5": {
      inputTokenRate: 0.003 / 1000,
      outputTokenRate: 0.015 / 1000,
      cacheCreationRate: 0.00375 / 1000,
      cacheReadRate: 0.0003 / 1000,
    },
  },
  orgBudget: 1000,
  alertThresholds: [0.5, 0.75, 0.9, 0.95],
  alertCallback: async (alert) => {
    // Send email, Slack notification, etc.
    await sendAlert(alert);
  },
});
```

### Cost Reporting

```typescript
// Get summary
const summary = costTracker.getSummary();

console.log(`Total Cost: $${summary.totalCost.toFixed(4)}`);
console.log(`Input Tokens: ${summary.totalInputTokens.toLocaleString()}`);
console.log(`Output Tokens: ${summary.totalOutputTokens.toLocaleString()}`);
console.log(`Messages: ${summary.messageCount}`);

// Per-user costs
for (const [userId, cost] of Object.entries(summary.byUser)) {
  console.log(`${userId}: $${cost.toFixed(4)}`);
}

// Export for billing
const usageData = costTracker.exportUsageData();
fs.writeFileSync("usage-report.json", JSON.stringify(usageData, null, 2));
```

## 🔒 Security

### Command Blocklist

Default blocked patterns:

- `rm -rf /` - Dangerous deletions
- `sudo` - Privilege escalation
- `wget`, `curl http://` - External downloads
- `chmod 777` - Insecure permissions
- Fork bombs and malicious patterns

### Path Validation

```typescript
import { SecurityManager } from "./lib/security/security-layer";

const security = new SecurityManager(config.getSecurityConfig());

try {
  security.validatePath("/home/user/file.txt");
  security.validateCommand("ls -la");
} catch (error) {
  console.error("Security violation:", error.message);
}
```

### Secrets Detection

```typescript
// Check if file contains secrets
const hasSecrets = await security.containsSecrets("config.env");
if (hasSecrets) {
  console.warn("File contains secrets!");
}

// Redact secrets from output
const safeOutput = security.redactSecrets(output);
console.log(safeOutput);
```

### Audit Logging

```typescript
// Get audit log
const auditLog = security.getAuditLog();

// Export for compliance
const complianceReport = security.exportAuditLog(
  new Date("2024-01-01"),
  new Date("2024-12-31"),
);

fs.writeFileSync("audit-log.json", JSON.stringify(complianceReport, null, 2));
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- streaming-agent.test.ts
```

## 📈 Performance

### Fine-Grained Tool Streaming

Enabled by default for 3s vs 15s latency improvement:

```typescript
const agent = new StreamingAgent(apiKey);

// Fine-grained streaming automatically enabled
for await (const message of agent.query(messages, {
  betas: ["fine-grained-tool-streaming-2025-05-14"],
})) {
  // Process messages as they arrive
}
```

### Container Reuse

Code execution containers persist for 30 days:

```typescript
const codeExec = new CodeExecutionTool({ apiKey });

// Create session
const sessionId = await codeExec.createSession("data-analysis");

// Reuse container
await codeExec.executeInSession(sessionId, "import pandas as pd");
await codeExec.executeInSession(sessionId, "df = pd.read_csv('data.csv')");
```

## 🎓 Best Practices

1. **Always use streaming mode** for interactive scenarios
2. **Enable cost tracking** for all production deployments
3. **Use subagents** for specialized tasks (security, testing, docs)
4. **Implement proper error handling** around tool execution
5. **Enable audit logging** for compliance requirements
6. **Use Chain of Thought** for complex reasoning tasks
7. **Validate inputs** before passing to tools
8. **Monitor budget usage** and set appropriate thresholds
9. **Regular security audits** of code and configurations
10. **Keep secrets** out of code and logs

## 🔗 References

### AI Model Selection

- **[AI Model Review & Selection Guide](AI-MODEL-REVIEW.md)** - Comprehensive comparison of AI tools
  - Gemini, Claude, Codex, Cursor, Copilot, and Droid comparison
  - Decision trees and role-based recommendations
  - Security postures, output formats, and CI/CD integration
  - Cost and performance benchmarks
  - When to use which model for your specific tasks

### Official Documentation

- [Tool Use Implementation](https://docs.claude.com/en/docs/agents-and-tools/tool-use/implement-tool-use.md)
- [Fine-Grained Tool Streaming](https://docs.claude.com/en/docs/agents-and-tools/tool-use/fine-grained-tool-streaming.md)
- [Agent SDK](https://docs.claude.com/en/docs/agents-and-tools/agent-sdk/)
- [Prompt Engineering](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/)

### Implementation Guides

- [Claude Enterprise Implementation](CLAUDE-ENTERPRISE-IMPLEMENTATION.md)
- [Tool Use Best Practices](TOOL-USE-IMPLEMENTATION.md)
- [Usage Guide](USAGE.md)

## 📝 License

MIT License - see [LICENSE](../LICENSE) for details.

## 🆘 Support

- Documentation: [docs/](../docs/)
- Issues: GitHub Issues
- Enterprise Support: contact@enterprise.com
