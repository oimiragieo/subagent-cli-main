# lib/ Directory - Core Library

## Purpose

This directory contains the core library code for the Subagent CLI framework. It includes the base agent class, tool executor, platform detector, and various TypeScript modules for enterprise features.

## Structure

```
lib/
├── agent-base.js              # ✅ Base class for all agents (682 lines)
├── tool-executor.js           # ✅ Command execution engine (324 lines)
├── platform-detector.js       # ✅ Platform/shell detection (298 lines)
│
├── agents/
│   └── subagent-orchestrator.ts  # ⚠️ Enterprise specialized agents (TS errors)
│
├── config/
│   └── enterprise-config.ts      # ⚠️ Enterprise configuration (TS errors)
│
├── security/
│   └── security-layer.ts         # ⚠️ Security enforcement (NOT INTEGRATED!)
│
├── tracking/
│   ├── cost-tracker.ts           # ⚠️ Cost tracking (doesn't enforce limits)
│   └── todo-tracker.ts           # ✅ Todo management
│
├── streaming/
│   └── streaming-agent.ts        # ⚠️ Streaming support (TS errors)
│
├── tools/
│   ├── bash-tool.ts              # ⚠️ Bash execution tool (TS errors)
│   ├── code-execution-tool.ts    # ⚠️ Code execution (TS errors)
│   └── text-editor-tool.ts       # ⚠️ Text editing (TS errors)
│
├── types/
│   └── index.ts                  # ✅ TypeScript type definitions (443 lines)
│
└── prompts/
    └── prompt-templates.ts       # ✅ Prompt template management
```

## Key Files

### agent-base.js (JavaScript - Working)

**Status:** ✅ Fully functional with limitations

**Purpose:** Base class for all AI agents providing common functionality

**Key Features:**
- Agent initialization with system prompts and tools
- Tool registry loading and availability detection
- Task execution framework (plan → execute → post-process)
- Claude API integration patterns (currently mocked)
- Parallel tool execution support
- Tool validation per Claude spec
- Conversation history tracking

**Known Issues:**
1. `planTask()` is a stub - always returns empty steps
2. `executeWithClaude()` returns mocked responses, not real Claude API calls
3. `executeClaudeTool()` throws error - must be overridden in subclass

**Class Structure:**
```javascript
class AgentBase {
  constructor(config)
  async initialize()
  async execute(task, options)
  async planTask(task, options)         // ⚠️ STUB
  async executePlan(plan, options)
  async executeWithClaude(userMessage)  // ⚠️ MOCKED
  async executeToolsParallel(toolUseBlocks)
  registerClaudeTool(tool)
  validateToolDefinition(tool)
  getAvailableTools()
  getInfo()
  export()
}
```

**Usage:**
```javascript
const agent = new AgentBase({ name: 'DevOps Agent', type: 'devops' });
await agent.initialize();
const result = await agent.execute('Deploy to Kubernetes');
```

### tool-executor.js (JavaScript - Working)

**Status:** ✅ Fully functional

**Purpose:** Execute CLI commands across different platforms with proper error handling

**Key Features:**
- Cross-platform command execution (Windows/macOS/Linux)
- Shell-specific execution (PowerShell, Bash, cmd)
- Streaming output support
- Timeout and buffer limit enforcement
- Tool availability checking
- Execution history tracking
- Success rate statistics

**NOT Implemented:**
- Security validation (SecurityManager not integrated)

**Class Structure:**
```javascript
class ToolExecutor {
  constructor(config)
  async execute(command, options)
  async executeStreaming(command, options, onData, onError)
  async executePowerShell(command, options)
  async executeBash(command, options)
  async executeCrossPlatform(winCmd, unixCmd, options)
  async isToolAvailable(toolName)
  async getToolVersion(toolName, versionFlag)
  async executeSequence(commands, options)
  async executeParallel(commands, options)
  getStats()
}
```

**Default Configuration:**
```javascript
{
  timeout: 300000,        // 5 minutes
  maxBuffer: 10485760,    // 10 MB
  shell: 'bash',          // or platform default
  encoding: 'utf8'
}
```

### platform-detector.js (JavaScript - Working)

**Status:** ✅ Fully functional

**Purpose:** Detect current platform, available shells, and system information

**Key Features:**
- Platform detection (windows, macos, linux, unix)
- Shell availability checking with priority ordering
- Shell version detection
- Comprehensive platform information
- Cross-platform shell identification

**Class Structure:**
```javascript
class PlatformDetector {
  constructor()
  detectPlatform()
  detectAvailableShells()
  getDefaultShell()
  getShellByName(name)
  getCrossPlatformShells()
  getPlatformInfo()
  isWindows()
  isMacOS()
  isLinux()
  isUnix()
}
```

**Detected Shells (Priority Order):**

**Windows:**
1. pwsh (PowerShell Core 7+)
2. powershell (Windows PowerShell 5.1)
3. cmd (Command Prompt)
4. bash (Git Bash/WSL)

**macOS/Linux:**
1. bash (Bourne Again Shell)
2. zsh (Z Shell)
3. fish (Friendly Interactive Shell)
4. pwsh (PowerShell Core)
5. sh (POSIX Shell - fallback)

## TypeScript Modules

### types/index.ts

**Status:** ✅ Compiles (1 unused import warning)

**Purpose:** Comprehensive TypeScript type definitions for the entire framework

**Exports:**
- Message types (UserMessage, AssistantMessage, Message, ContentBlock)
- Streaming types (StreamingConfig, AgentMessage, StreamEvent)
- Cost tracking types (ModelPricing, StepUsage, TrackingContext, CostSummary, BudgetAlert)
- Tool config types (BashToolConfig, CodeExecutionConfig, TextEditorConfig)
- Security types (SecurityConfig, AuditLogEntry, ResourceLimits, ResourceMetrics)
- Enterprise config types (EnterpriseConfig, AgentConfig, ToolCategory)
- Custom errors (BudgetExceededError, SecurityError, ResourceLimitError)

**Usage:**
```typescript
import { UserMessage, AssistantMessage, SecurityConfig } from './lib/types';
```

### security/security-layer.ts

**Status:** ⚠️ Implemented but NOT INTEGRATED

**Purpose:** Comprehensive security enforcement for command execution

**SecurityManager Class:**
```typescript
class SecurityManager {
  validateCommand(command: string): void
  validatePath(filePath: string, allowedDirs?: string[]): void
  checkResourceLimits(metrics: ResourceMetrics): void
  logSecurityEvent(event: Partial<AuditLogEntry>): void
  exportAuditLog(): Promise<AuditLogEntry[]>
}
```

**Blocked Patterns:**
- `rm -rf /`
- `sudo -`
- `eval`
- `exec`
- `source`

**Sensitive Paths:**
- `/etc/passwd`, `/etc/shadow`
- `/root`
- `~/.ssh`, `~/.aws`, `~/.config`

**CRITICAL:** This is NOT currently integrated into ToolExecutor!

**To Integrate:**
```javascript
// In tool-executor.js:
const { SecurityManager } = require('./security/security-layer');

class ToolExecutor {
  constructor(config) {
    this.security = new SecurityManager(config.security || {});
  }

  async execute(command, options) {
    // ADD THIS LINE:
    this.security.validateCommand(command);

    // ... rest of execution
  }
}
```

### tracking/cost-tracker.ts

**Status:** ⚠️ Tracks costs but doesn't enforce limits

**Purpose:** Real-time usage and budget management for Claude API calls

**CostTracker Class:**
```typescript
class CostTracker {
  async onMessage(message: AgentMessage, context?: TrackingContext)
  private calculateCost(usage: Usage, model: string): number
  private async checkBudgetThresholds(): Promise<void>
  getCostSummary(): CostSummary
  getCostsByUser(): Map<string, number>
  getCostsByProject(): Map<string, number>
}
```

**Features:**
- Message ID deduplication (prevents double-charging)
- Per-user cost attribution
- Per-project cost attribution
- Budget threshold alerts (50%, 75%, 90%, 95%)
- Cache-aware pricing (cheaper for cache reads)

**ISSUE:** Never throws BudgetExceededError for hard limits!

**To Fix:**
```typescript
private async checkBudgetThresholds(): Promise<void> {
  const summary = this.getCostSummary();

  // ADD THIS CHECK:
  if (summary.totalCost >= this.orgBudget) {
    throw new BudgetExceededError(
      `Budget exceeded: $${summary.totalCost} >= $${this.orgBudget}`
    );
  }

  // ... existing threshold alerts
}
```

### agents/subagent-orchestrator.ts

**Status:** ⚠️ TypeScript errors prevent compilation

**Purpose:** Enterprise specialized agents for advanced tasks

**Specialized Agents:**
1. `security-auditor` - OWASP/compliance security audits
2. `test-engineer` - Test suite creation and execution
3. `documentation-writer` - Technical documentation generation
4. `performance-analyzer` - Performance optimization analysis
5. `code-reviewer` - Code quality and design reviews
6. `data-analyst` - Data analysis and insights

**TypeScript Errors:** 0 (minimal issues, but depends on other failing files)

### tools/ (Bash, Code, Text Editor)

**Status:** ⚠️ All have TypeScript errors

**Files:**
- `bash-tool.ts` - Bash session management (7 errors)
- `code-execution-tool.ts` - Sandboxed code execution (8 errors)
- `text-editor-tool.ts` - File editing capabilities (errors)

**Common Issues:**
- Type compatibility with Anthropic SDK
- Optional vs required properties
- Unused variables
- Duplicate function implementations

### streaming/streaming-agent.ts

**Status:** ⚠️ 10 TypeScript errors

**Purpose:** Real-time streaming support for Claude API

**Issues:**
- Type mismatches with Anthropic SDK ContentBlock types
- Usage type incompatibilities (null vs undefined)
- StopReason type issues

### config/enterprise-config.ts

**Status:** ⚠️ 3 TypeScript errors

**Purpose:** Enterprise configuration management

**Issues:**
- Optional vs required `enabled` properties
- Type compatibility issues with tool configs

## TypeScript Compilation Status

**Overall:** ⚠️ **32 ERRORS** - Compilation FAILS

**Error Breakdown:**
- `enterprise-config.ts` - 3 errors
- `streaming-agent.ts` - 10 errors
- `bash-tool.ts` - 7 errors
- `code-execution-tool.ts` - 8 errors
- `types/index.ts` - 1 error
- Other files - 3 errors

**Impact:** No dist/ directory generated, TypeScript code can't be used directly

**Workaround:** JavaScript files (.js) work fine and are the primary codebase

## Development Guidelines

### When Modifying Core Files

**agent-base.js:**
- Keep JavaScript for maximum compatibility
- Maintain backward compatibility with existing agents
- Document any new methods with JSDoc
- Don't break the executeWithClaude() pattern (even if mocked)
- Add Claude API integration when ready

**tool-executor.js:**
- Add SecurityManager integration ASAP
- Keep cross-platform compatibility
- Test on Windows, macOS, and Linux
- Don't increase default timeout without good reason
- Add more platform-specific methods as needed

**platform-detector.js:**
- Add new shell detection carefully
- Maintain priority ordering
- Test new shells thoroughly
- Don't remove existing shell support

### When Adding TypeScript Files

- Follow existing type patterns in `types/index.ts`
- Ensure strict TypeScript compliance
- Export types for external use
- Match Anthropic SDK types where applicable
- Add JSDoc for complex types

### Testing Requirements

**Unit Tests Needed:**
- AgentBase class methods
- ToolExecutor command execution
- PlatformDetector shell detection
- SecurityManager validation
- CostTracker calculations

**Integration Tests Needed:**
- Full agent execution flow
- Multi-platform command execution
- Tool availability detection
- Security policy enforcement

## Known Issues & TODOs

### High Priority

1. [ ] Fix 32 TypeScript compilation errors
2. [ ] Integrate SecurityManager into ToolExecutor
3. [ ] Implement real Claude API calls in executeWithClaude()
4. [ ] Add budget hard limit enforcement in CostTracker
5. [ ] Implement planTask() with actual LLM planning
6. [ ] Create test suite (currently ZERO tests)

### Medium Priority

7. [ ] Add persistent state (SQLite/database)
8. [ ] Implement sandbox mode for dangerous commands
9. [ ] Add audit log persistence
10. [ ] Create worker pool for parallel execution
11. [ ] Add caching for tool availability
12. [ ] Implement streaming UI updates

### Low Priority

13. [ ] Migrate JavaScript files to TypeScript
14. [ ] Add more granular error types
15. [ ] Implement connection pooling
16. [ ] Add Redis integration
17. [ ] Create performance benchmarks

## Dependencies

**JavaScript Files:**
- Node.js built-ins: `fs`, `path`, `child_process`, `os`
- No external dependencies (self-contained)

**TypeScript Files:**
- `@anthropic-ai/sdk` - ^0.70.0
- Node.js type definitions

## AI Assistant Guidelines

**When working with lib/ directory:**

✅ **DO:**
- Read this claude.md first
- Check if file is JavaScript (.js) or TypeScript (.ts)
- Use JavaScript files directly (they work)
- Understand TypeScript files won't compile yet
- Know that SecurityManager exists but isn't used
- Remember Claude API integration is mocked

❌ **DON'T:**
- Assume dist/ directory exists
- Expect TypeScript code to run
- Rely on SecurityManager being called
- Trust that budget limits are enforced
- Assume tests exist for validation

---

**Last Updated:** 2025-11-19
**Status:** Core JavaScript functional, TypeScript needs fixes
**Next Steps:** Fix TS errors, integrate security, implement Claude API
