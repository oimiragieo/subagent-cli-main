# Subagent CLI - Enterprise AI Agent Framework

## Project Overview

**Project Name:** Subagent CLI Main
**Version:** 1.0.0
**Type:** Enterprise-grade multi-agent AI CLI framework
**Primary Language:** JavaScript (CommonJS) + TypeScript
**Runtime:** Node.js >= 14.0.0
**License:** MIT

### Purpose

This is an enterprise Command Line Interface (CLI) framework that provides 6 specialized AI agents powered by Claude (Anthropic's API) to automate complex tasks across Windows, macOS, and Linux platforms. The framework enables autonomous AI agents to execute CLI commands, manage infrastructure, perform security audits, analyze data, and more.

### Key Features

- **6 Specialized AI Agents**: DevOps, Cloud, Security, Data, System, Code
- **Cross-Platform Support**: Windows (PowerShell, cmd), macOS (bash, zsh), Linux (bash)
- **50+ Integrated CLI Tools**: Docker, Kubernetes, Terraform, AWS CLI, etc.
- **Enterprise-Ready**: Cost tracking, security enforcement, audit logging
- **Claude Integration**: Full tool use, streaming, parallel execution patterns
- **Security-First**: Command validation, path traversal prevention, resource limits

## Critical Findings & Issues

### 🚨 High Priority Issues

1. **NO claude.md files existed** - This is the first one being created
2. **Anthropic SDK version mismatch** - package.json specified ^0.37.1 which doesn't exist (updated to ^0.70.0)
3. **TypeScript compilation FAILS** - 32 TypeScript errors preventing dist/ generation
4. **Claude API integration is MOCKED** - executeWithClaude() returns hardcoded responses, not real API calls
5. **Security layer NOT integrated** - SecurityManager exists but isn't called by ToolExecutor
6. **Cost tracker doesn't enforce limits** - calculates costs but never throws BudgetExceededError
7. **No automated tests** - Jest configured but zero test files exist
8. **No persistent state** - All data in-memory, lost on process exit

### ⚠️ Medium Priority Issues

9. **README architecture mismatch** - Shows `agents/` directory structure that doesn't exist
10. **planTask() is a stub** - Always returns empty steps, task planning not implemented
11. **Mixed JS/TS codebase** - Core in JavaScript, advanced features in TypeScript
12. **Dependencies not installed by default** - npm install required before any usage
13. **No dist/ directory** - TypeScript compilation broken, no compiled output

## Project Structure

```
subagent-cli-main/
├── cli.js                          # ✅ Entry point (283 lines, JavaScript)
├── package.json                    # ⚠️ Fixed SDK version
├── tsconfig.json                   # ⚠️ Strict TypeScript config
├── .env.example                    # ✅ Environment template
├── .gitignore                      # ✅ Proper exclusions
│
├── lib/                            # Core library
│   ├── agent-base.js              # ✅ 682 lines - Base agent class
│   ├── tool-executor.js           # ✅ 324 lines - Command execution
│   ├── platform-detector.js       # ✅ 298 lines - Platform/shell detection
│   │
│   ├── agents/
│   │   └── subagent-orchestrator.ts  # ⚠️ Enterprise agents (has TS errors)
│   │
│   ├── config/
│   │   └── enterprise-config.ts    # ⚠️ Enterprise config (has TS errors)
│   │
│   ├── security/
│   │   └── security-layer.ts       # ⚠️ NOT INTEGRATED into ToolExecutor
│   │
│   ├── tracking/
│   │   ├── cost-tracker.ts         # ⚠️ Tracks but doesn't enforce
│   │   └── todo-tracker.ts         # ✅ Todo management
│   │
│   ├── streaming/
│   │   └── streaming-agent.ts      # ⚠️ Has TS errors
│   │
│   ├── tools/
│   │   ├── bash-tool.ts            # ⚠️ Has TS errors
│   │   ├── code-execution-tool.ts  # ⚠️ Has TS errors
│   │   └── text-editor-tool.ts     # ⚠️ Has TS errors
│   │
│   ├── types/
│   │   └── index.ts                # ✅ 443 lines - Comprehensive types
│   │
│   └── prompts/
│       └── prompt-templates.ts     # ✅ Prompt management
│
├── prompts/                        # Agent system prompts
│   ├── system.md                   # ✅ System agent instructions
│   ├── devops.md                   # ✅ DevOps agent instructions
│   ├── cloud.md                    # ✅ Cloud agent instructions
│   ├── security.md                 # ✅ Security agent instructions
│   ├── data.md                     # ✅ Data agent instructions
│   └── code.md                     # ✅ Code agent instructions
│
├── tools/                          # Tool registry
│   ├── registry.json               # ✅ 58 tools defined
│   └── platform/                   # Platform-specific tools
│
├── config/                         # Configuration
│   ├── config.json                 # ✅ Active config (gitignored)
│   └── config.example.json         # ✅ Template config
│
├── scripts/                        # Utility scripts
│   ├── verify-installation.js      # ✅ Installation verification
│   ├── dev-setup.sh               # ✅ Linux/macOS setup
│   └── dev-setup.ps1              # ✅ Windows setup
│
├── examples/                       # Usage examples
│   ├── devops-example.sh
│   ├── cloud-example.ps1
│   └── tool-definitions-example.js
│
├── docs/                           # Comprehensive documentation
│   ├── IMPLEMENTATION-README.md    # Main implementation guide
│   ├── WINDOWS-REFERENCE.md        # Windows command reference
│   ├── MACOS-REFERENCE.md          # macOS command reference
│   ├── LINUX-REFERENCE.md          # Linux command reference
│   └── [many more...]
│
├── .github/                        # CI/CD and templates
│   ├── workflows/
│   │   └── ci.yml                  # ✅ Multi-OS testing
│   └── ISSUE_TEMPLATE/
│
└── README.md                       # ⚠️ Architecture section inaccurate

NO node_modules/ - Must run npm install first!
NO dist/ - TypeScript compilation broken
NO tests/ - Zero test files despite Jest config
```

## Architecture & Components

### 1. Entry Point: cli.js (283 lines)

**Location:** `/home/user/subagent-cli-main/cli.js`
**Framework:** Commander.js
**Status:** ✅ Working

**Commands:**

- `node cli.js info` - Display system/platform information
- `node cli.js agents` - List all available agents
- `node cli.js tools [--category <cat>]` - List available tools
- `node cli.js devops <task>` - Execute DevOps task
- `node cli.js cloud <task>` - Execute cloud task
- `node cli.js security <task>` - Execute security task
- `node cli.js data <task>` - Execute data task
- `node cli.js system <task>` - Execute system task
- `node cli.js code <task>` - Execute code task
- `node cli.js interactive` - Interactive mode

**Configuration Loading:**

```javascript
const configPath = path.join(__dirname, "config", "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
```

**Agent Execution Flow:**

```javascript
async function executeAgent(agentType, task) {
  // 1. Check if agent enabled
  // 2. Create AgentBase instance
  // 3. Initialize agent (load prompts, tools)
  // 4. Execute task
  // 5. Display results
}
```

### 2. AgentBase Class (682 lines)

**Location:** `/home/user/subagent-cli-main/lib/agent-base.js`
**Status:** ✅ Functional but with limitations

**Key Methods:**

- `initialize()` - Load system prompt, tools, detect availability
- `execute(task)` - Main execution method (plan → execute → post-process)
- `planTask(task)` - ⚠️ **STUB** - Always returns empty steps
- `executePlan(plan)` - Execute steps sequentially
- `executeWithClaude(userMessage)` - ⚠️ **MOCKED** - Returns hardcoded response
- `executeToolsParallel(toolUseBlocks)` - Parallel tool execution pattern
- `registerClaudeTool(tool)` - Validate and register Claude tools
- `validateToolDefinition(tool)` - Strict validation per Claude spec

**CRITICAL LIMITATION:**

```javascript
async planTask(task, options = {}) {
  // This is a placeholder - in a real implementation, this would use
  // an LLM API to generate a plan based on the system prompt and available tools
  return {
    task,
    steps: [],  // ⚠️ ALWAYS EMPTY!
    estimatedDuration: 0,
    requiredTools: [],
    platform: this.platform.platform
  };
}
```

**Claude Integration Pattern:**

```javascript
async executeWithClaude(userMessage, options = {}) {
  // Proper tool loop implementation:
  // 1. Add user message to history
  // 2. while (iteration < maxIterations):
  //    - Call Claude API with tools
  //    - If stop_reason === 'tool_use':
  //      - Execute tools in parallel
  //      - Add results to history as single user message
  //      - Continue loop
  //    - else: return final response

  // ⚠️ BUT actual API call is commented out!
  // const response = await this.claude.messages.create(request);
}
```

### 3. ToolExecutor Class (324 lines)

**Location:** `/home/user/subagent-cli-main/lib/tool-executor.js`
**Status:** ✅ Fully functional

**Configuration:**

```javascript
{
  timeout: 300000,        // 5 minutes
  maxBuffer: 10485760,    // 10MB
  shell: 'bash',          // or detected default
  encoding: 'utf8'
}
```

**Key Methods:**

- `execute(command, options)` - Execute command, return result object
- `executeStreaming(command, options, onData, onError)` - Real-time output
- `executePowerShell(command)` - Windows PowerShell execution
- `executeBash(command)` - Unix/Linux bash execution
- `executeCrossPlatform(winCmd, unixCmd)` - Platform-aware execution
- `isToolAvailable(toolName)` - Check if tool exists (which/where)
- `getToolVersion(toolName, versionFlag)` - Get tool version
- `executeSequence(commands)` - Sequential execution with stopOnError
- `executeParallel(commands)` - Parallel Promise.all execution
- `getStats()` - Success rate, avg duration, platform

**Execution Result Format:**

```javascript
{
  id: 'exec_1234567890_abc123',
  command: 'docker ps',
  shell: 'bash',
  platform: 'linux',
  startTime: 1234567890,
  endTime: 1234567891,
  duration: 1,
  exitCode: 0,
  stdout: '...',
  stderr: '',
  error: null,
  success: true
}
```

**⚠️ SECURITY ISSUE:** SecurityManager NOT called before command execution!

### 4. PlatformDetector Class (298 lines)

**Location:** `/home/user/subagent-cli-main/lib/platform-detector.js`
**Status:** ✅ Fully functional

**Detected Platforms:**

- `windows` (win32)
- `macos` (darwin)
- `linux` (linux)
- `unix` (freebsd, openbsd, sunos)

**Shell Detection Priority:**

**Windows:**

1. pwsh (PowerShell Core 7+)
2. powershell (Windows PowerShell 5.1)
3. cmd (Command Prompt)
4. bash (Git Bash/WSL)

**macOS/Linux:**

1. bash (Bourne Again Shell) - priority 1
2. zsh (Z Shell) - priority 1 on macOS, 2 on Linux
3. fish (Friendly Interactive Shell) - priority 3
4. pwsh (PowerShell Core) - priority 4
5. sh (POSIX Shell) - priority 99 (fallback)

**Key Methods:**

- `detectPlatform()` - Returns platform string
- `detectAvailableShells()` - Returns sorted array of shell objects
- `getDefaultShell()` - Returns highest priority available shell
- `getPlatformInfo()` - Comprehensive system information
- `isCommandAvailable(command)` - Uses which/where to check

### 5. TypeScript Components (⚠️ Multiple errors)

#### types/index.ts (443 lines)

**Location:** `/home/user/subagent-cli-main/lib/types/index.ts`
**Status:** ✅ Compiles (1 warning)

**Defines:**

- Message types (UserMessage, AssistantMessage)
- StreamingConfig, AgentMessage, StreamEvent
- ModelPricing, StepUsage, TrackingContext, CostSummary
- Tool definitions (BashToolConfig, CodeExecutionConfig, TextEditorConfig)
- Security types (SecurityConfig, AuditLogEntry, ResourceLimits)
- Enterprise config types
- Custom errors (BudgetExceededError, SecurityError, ResourceLimitError)

#### security/security-layer.ts

**Location:** `/home/user/subagent-cli-main/lib/security/security-layer.ts`
**Status:** ⚠️ **NOT INTEGRATED**

**SecurityManager Class:**

```typescript
class SecurityManager {
  validateCommand(command: string): void;
  validatePath(filePath: string, allowedDirs?: string[]): void;
  checkResourceLimits(metrics: ResourceMetrics): void;
  logSecurityEvent(event: Partial<AuditLogEntry>): void;
  exportAuditLog(): Promise<AuditLogEntry[]>;
}
```

**Blocked Patterns:**

```javascript
commandBlocklist: [
  /rm\s+-rf\s+\//, // Dangerous rm
  /sudo\s+-/, // Sudo commands
  /eval/, // Code evaluation
  /exec/, // Execution
  /source/, // Source loading
];
```

**Sensitive Paths:**

- `/etc/passwd`
- `/etc/shadow`
- `/root`
- `~/.ssh`
- `~/.aws`
- `~/.config`

**⚠️ CRITICAL:** This security layer is implemented but **NEVER CALLED** by ToolExecutor!

#### tracking/cost-tracker.ts

**Location:** `/home/user/subagent-cli-main/lib/tracking/cost-tracker.ts`
**Status:** ⚠️ Tracks but doesn't enforce

**CostTracker Class:**

```typescript
class CostTracker {
  async onMessage(message: AgentMessage, context?: TrackingContext);
  private calculateCost(usage: Usage, model: string): number;
  private async checkBudgetThresholds(): Promise<void>;
  getCostSummary(): CostSummary;
  getCostsByUser(): Map<string, number>;
  getCostsByProject(): Map<string, number>;
}
```

**Features:**

- Message ID deduplication (prevents double-charging)
- Per-user cost attribution
- Per-project cost attribution
- Budget threshold alerts (50%, 75%, 90%, 95%)
- Cache-aware pricing

**⚠️ ISSUE:** Alerts at thresholds but NEVER throws BudgetExceededError for hard limits!

#### agents/subagent-orchestrator.ts

**Location:** `/home/user/subagent-cli-main/lib/agents/subagent-orchestrator.ts`
**Status:** ⚠️ TypeScript errors

**Specialized Agents:**

1. `security-auditor` - OWASP/compliance audits
2. `test-engineer` - Test suite creation
3. `documentation-writer` - Technical docs
4. `performance-analyzer` - Performance optimization
5. `code-reviewer` - Code quality reviews
6. `data-analyst` - Data analysis

### 6. Tool Registry

**Location:** `/home/user/subagent-cli-main/tools/registry.json`
**Status:** ✅ 58 tools defined

**Categories:**

- devops (17 tools)
- cloud (5 tools)
- security (8 tools)
- data (7 tools)
- system (12 tools)
- code (6 tools)
- networking (2 tools)
- monitoring (1 tool)

**Sample Tool Definition:**

```json
{
  "name": "docker",
  "command": "docker",
  "description": "Container management platform",
  "category": "devops",
  "platforms": ["windows", "macos", "linux"],
  "agents": ["devops", "cloud", "system"],
  "versionCommand": "--version",
  "commonCommands": ["docker build", "docker run", "docker ps"]
}
```

**Tool Assignment:**

- `"agents": ["*"]` = Available to all agents (e.g., git)
- `"agents": ["devops", "cloud"]` = Specific agents only

### 7. System Prompts

**Location:** `/home/user/subagent-cli-main/prompts/*.md`
**Status:** ✅ Comprehensive (6 files)

**Files:**

- `system.md` - System administration
- `devops.md` - DevOps operations
- `cloud.md` - Cloud infrastructure
- `security.md` - Security operations
- `data.md` - Data engineering
- `code.md` - Software development

**Format:**

```markdown
# [Agent Name] - System Prompt

## Role and Identity

You are a [Agent Type], specialized in...

## Core Responsibilities

- Responsibility 1
- Responsibility 2

## Available Tools and Usage

### Tool Category

#### Tool Name

- Usage examples
- Best practices
- Safety guidelines
```

**Loading Mechanism:**

```javascript
async loadSystemPrompt() {
  const promptPath = path.join(__dirname, '..', 'prompts', `${this.type}.md`);
  this.systemPrompt = await fs.readFile(promptPath, 'utf8');
}
```

## Configuration

### Environment Variables (.env)

**Location:** `/home/user/subagent-cli-main/.env`
**Template:** `.env.example`
**Status:** ⚠️ .env not in repo (gitignored)

**Required:**

```bash
ANTHROPIC_API_KEY=your-key-here   # REQUIRED for Claude API
```

**Optional:**

```bash
LOG_LEVEL=info
LOG_FILE=./logs/subagent-cli.log
DEFAULT_MODEL=claude-sonnet-4.5
MAX_TOKENS=4096
BUDGET_LIMIT=0                    # 0 = unlimited
USER_ID=default-user
PROJECT_ID=default-project
SANDBOX_MODE=false
ALLOW_SUDO=false                  # Dangerous!
CONFIRM_DESTRUCTIVE=true
EXECUTION_TIMEOUT=300000
MAX_RETRIES=3
CACHE_TTL=3600
```

### Application Config (config.json)

**Location:** `/home/user/subagent-cli-main/config/config.json`
**Template:** `config/config.example.json`
**Status:** ✅ Exists (gitignored)

**Structure:**

```json
{
  "version": "1.0.0",
  "platform": "auto",
  "defaultShell": "auto",

  "agents": {
    "devops": { "enabled": true, "priority": 1, "description": "..." },
    "cloud": { "enabled": true, "priority": 2, "description": "..." }
    // ... 4 more agents
  },

  "tools": {
    "allowList": ["*"],
    "denyList": [],
    "autoDetect": true,
    "requireConfirmation": false
  },

  "execution": {
    "timeout": 300000,
    "maxBuffer": 10485760,
    "retries": 3,
    "retryDelay": 1000
  },

  "logging": {
    "level": "info",
    "file": "./logs/subagent-cli.log",
    "console": true,
    "includeTimestamp": true
  },

  "security": {
    "sandboxMode": false,
    "allowSudo": false,
    "confirmDestructive": true,
    "auditLog": true
  },

  "output": {
    "format": "text",
    "color": true,
    "verbose": false,
    "maxLineLength": 120
  },

  "cache": {
    "enabled": true,
    "ttl": 3600,
    "directory": "./.cache"
  }
}
```

## Installation & Setup

### Prerequisites

```bash
Node.js >= 14.0.0
npm >= 6.0.0
```

### Installation Steps

```bash
# 1. Clone repository
git clone <repo-url>
cd subagent-cli-main

# 2. Install dependencies (REQUIRED!)
npm install

# 3. Build TypeScript files (⚠️ CURRENTLY FAILS)
npm run build

# 4. Set up environment
cp .env.example .env
# Edit .env and add ANTHROPIC_API_KEY

# 5. Verify installation
npm run verify
```

### Current Installation Issues

1. **TypeScript compilation fails** (32 errors)
2. **No dist/ directory** until TS errors fixed
3. **npm install required** before any CLI usage

## Usage

### Basic Commands

```bash
# Display system information
node cli.js info

# List all agents
node cli.js agents

# List all tools
node cli.js tools

# List tools by category
node cli.js tools --category devops

# Execute agent task
node cli.js devops "Deploy application to Kubernetes"
node cli.js security "Scan network for vulnerabilities"
node cli.js system "Check disk usage and clean up logs"

# Interactive mode
node cli.js interactive
```

### Programmatic Usage

```javascript
const AgentBase = require("./lib/agent-base");

// Create agent
const agent = new AgentBase({
  name: "DevOps Agent",
  type: "devops",
});

// Initialize
await agent.initialize();

// Execute task
const result = await agent.execute("Build Docker image");

console.log(result.success ? "Success!" : "Failed");
console.log(result.summary);
```

## Development

### NPM Scripts

```json
{
  "start": "node cli.js",
  "build": "tsc", // ⚠️ Currently fails
  "dev": "ts-node cli.ts",
  "test": "jest", // ⚠️ No tests exist
  "lint": "eslint .",
  "format": "prettier --write .",
  "verify": "node scripts/verify-installation.js",
  "setup": "npm install && npm run build && npm run verify"
}
```

### TypeScript Compilation Errors

**Status:** 32 errors, compilation FAILS

**Error Categories:**

1. **Type mismatches** (15 errors) - Optional vs required properties
2. **Unused variables** (4 errors) - Unused imports/parameters
3. **Duplicate implementations** (2 errors) - Multiple function definitions
4. **Type compatibility** (11 errors) - Anthropic SDK vs custom types

**Priority Fixes Needed:**

- `lib/config/enterprise-config.ts` - 3 errors
- `lib/streaming/streaming-agent.ts` - 10 errors
- `lib/tools/bash-tool.ts` - 7 errors
- `lib/tools/code-execution-tool.ts` - 8 errors
- `lib/types/index.ts` - 1 error

### Testing

**Status:** ⚠️ **ZERO TESTS**

**Configuration:**

- Jest v29.6.0 installed
- `@types/jest` v29.5.0 installed
- `npm run test` configured
- `**/*.spec.ts` and `**/*.test.ts` excluded from tsconfig

**Needed:**

- Unit tests for AgentBase
- Unit tests for ToolExecutor
- Unit tests for PlatformDetector
- Integration tests for CLI commands
- Tool availability tests

### CI/CD Pipeline

**Location:** `.github/workflows/ci.yml`
**Status:** ✅ Configured

**Triggers:** Push to main/develop, Pull requests

**Jobs:**

1. **Lint** (ubuntu) - ESLint + Prettier
2. **Build** (ubuntu) - TypeScript compilation
3. **Verify** (3 OS × 4 Node) - Multi-platform testing
4. **CLI Test** (3 OS) - Command execution
5. **Documentation** - Link checking
6. **Security** - npm audit + secrets scanning

**Test Matrix:**

- OS: ubuntu-latest, windows-latest, macos-latest
- Node: 14.x, 16.x, 18.x, 20.x

## Common Workflows

### Adding a New Agent

1. Create system prompt in `prompts/my-agent.md`
2. Add agent config to `config/config.json`:
   ```json
   "my-agent": {
     "enabled": true,
     "priority": 7,
     "description": "My custom agent"
   }
   ```
3. Add CLI command to `cli.js`:
   ```javascript
   program
     .command("my-agent <task>")
     .description("Execute my agent task")
     .action(async (task) => {
       await executeAgent("my-agent", task);
     });
   ```
4. Add relevant tools to `tools/registry.json`

### Adding a New Tool

1. Edit `tools/registry.json`:
   ```json
   {
     "name": "my-tool",
     "command": "my-tool",
     "description": "My custom tool",
     "category": "custom",
     "platforms": ["linux", "macos"],
     "agents": ["devops", "system"],
     "versionCommand": "--version"
   }
   ```
2. Agent will auto-detect availability on initialization

### Implementing Claude API Integration

**Current State:** executeWithClaude() has the pattern but mocked response

**To Implement:**

```javascript
// 1. Add Anthropic client to AgentBase constructor
const Anthropic = require("@anthropic-ai/sdk");

class AgentBase {
  constructor(config = {}) {
    // ... existing code
    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async executeWithClaude(userMessage, options = {}) {
    // ... existing setup code

    // REPLACE mocked response with real API call:
    const response = await this.claude.messages.create({
      model,
      max_tokens: maxTokens,
      system: this.systemPrompt,
      tools: Array.from(this.tools.values()),
      tool_choice: toolChoice,
      messages: this.conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    // ... rest of existing loop logic
  }
}
```

### Integrating Security Layer

**Current State:** SecurityManager exists but not called

**To Integrate:**

```javascript
// In ToolExecutor constructor:
const SecurityManager = require("./security/security-layer");

class ToolExecutor {
  constructor(config = {}) {
    // ... existing code
    this.security = new SecurityManager({
      commandBlocklist: [/rm\s+-rf\s+\//, /sudo\s+-/, /eval/, /exec/],
      auditLogging: true,
    });
  }

  async execute(command, options = {}) {
    // ADD security validation BEFORE execution:
    this.security.validateCommand(command);

    // ... rest of existing execution logic
  }
}
```

## Documentation

### Available Documentation (25 files, 300+ KB)

**Getting Started:**

- `README.md` - Project overview
- `QUICKSTART.md` - 5-minute setup guide
- `CONTRIBUTING.md` - Contribution guidelines

**Implementation:**

- `docs/IMPLEMENTATION-README.md` - Complete implementation guide
- `docs/CLAUDE-ENTERPRISE-IMPLEMENTATION.md` - Claude patterns
- `docs/TOOL-USE-IMPLEMENTATION.md` - Tool use best practices

**Platform References:**

- `docs/WINDOWS-REFERENCE.md` (24.4 KB)
- `docs/MACOS-REFERENCE.md` (18.2 KB)
- `docs/LINUX-REFERENCE.md` (22.7 KB)

**Scripting:**

- `docs/POWERSHELL-BATCH-SCRIPTS.md` (18.3 KB)
- `docs/PYTHON-SECURITY-TOOLS.md` (31.5 KB)
- `docs/SCAPY-REFERENCE.md` (26.3 KB)
- `docs/PERL-SCRIPTS.md` (27.4 KB)

**Audits & Analysis:**

- `CODE-QUALITY-REPORT.md` - Quality analysis
- `AUDIT-FINDINGS.md` - Audit results
- `FINAL-REVIEW-SUMMARY.md` - Comprehensive review

**Index:**

- `DOCUMENTATION-INDEX.md` - Master index linking all docs

### Documentation Gaps

**Missing:**

1. Architecture diagrams (visual system design)
2. Sequence diagrams (interaction flows)
3. API documentation (JSDoc/TSDoc minimal)
4. Video tutorials
5. Troubleshooting FAQ
6. Performance benchmarks
7. Database schema (no persistence layer)
8. Deployment guide (production)
9. Cost estimation examples

## Security Considerations

### Implemented Features

- ✅ Command blocklist patterns (in SecurityManager)
- ✅ Path traversal prevention
- ✅ Sensitive path detection
- ✅ Resource limits configuration
- ✅ Audit logging structure
- ✅ Environment variable isolation (.env in .gitignore)
- ✅ Secrets not committed

### NOT Implemented/Integrated

- ⚠️ SecurityManager NOT called by ToolExecutor
- ⚠️ Budget limits NOT enforced (only alerted)
- ⚠️ No audit log persistence
- ⚠️ No container/sandbox isolation
- ⚠️ ALLOW_SUDO can be enabled (dangerous!)
- ⚠️ No rate limiting
- ⚠️ No secrets manager integration (AWS/Azure)

### Security Recommendations

1. **Integrate SecurityManager** into ToolExecutor ASAP
2. **Enforce budget hard limits** in CostTracker
3. **Persist audit logs** to file/database
4. **Implement sandbox mode** using Docker/containers
5. **Never enable ALLOW_SUDO** in production
6. **Add rate limiting** for API calls
7. **Integrate secrets managers** for sensitive data

## Performance & Scalability

### Current Limitations

- **In-memory only** - All state lost on process exit
- **Single-threaded** - No worker pool for parallel tasks
- **No caching** - Tool availability checked every time
- **No connection pooling** - New process per command
- **No streaming UI** - Only spinner, no real-time output to user

### Recommended Improvements

1. **Add SQLite persistence** for conversation history, audit logs
2. **Implement worker pool** for parallel command execution
3. **Cache tool availability** with TTL
4. **Connection pooling** for long-running processes
5. **Streaming UI** with real-time output display
6. **Redis integration** for distributed caching

## Troubleshooting

### Common Issues

**1. "Cannot find module 'commander'"**

```bash
# Solution: Install dependencies
npm install
```

**2. "No matching version found for @anthropic-ai/sdk@^0.37.1"**

```bash
# Solution: Already fixed in package.json (now ^0.70.0)
npm install
```

**3. "TypeScript compilation failed"**

```bash
# Solution: Fix 32 TS errors (see TypeScript Compilation Errors section)
# For now, code runs fine without compilation (uses .js files)
```

**4. "Agent execution failed: planTask returned empty steps"**

```bash
# Expected: planTask() is a stub, doesn't use Claude API yet
# executeWithClaude() also mocked
# Real implementation needed
```

**5. "Command blocked by security policy"**

```bash
# Check: SecurityManager NOT integrated yet
# This error shouldn't happen unless you integrate it
```

## AI Assistant Usage Guidelines

### When Working with This Codebase

**DO:**

- ✅ Read this claude.md file first for complete context
- ✅ Check specific subdirectory claude.md files for detailed component info
- ✅ Run `npm install` before any operations
- ✅ Use `node cli.js` (not `npm start`) for direct execution
- ✅ Test commands with `node cli.js info` first
- ✅ Check `config/config.json` for agent/tool configuration
- ✅ Review `tools/registry.json` for available tools
- ✅ Read agent prompts in `prompts/*.md` for context
- ✅ Understand that TypeScript compilation fails (use .js files)
- ✅ Know that Claude API integration is mocked
- ✅ Be aware security layer exists but isn't integrated

**DON'T:**

- ❌ Assume dist/ directory exists (TS compilation broken)
- ❌ Expect tests to exist (zero test files)
- ❌ Rely on executeWithClaude() for real API calls (mocked)
- ❌ Assume security validation happens (not integrated)
- ❌ Trust budget enforcement (only alerts, no throws)
- ❌ Expect persistent state (all in-memory)
- ❌ Commit .env or config/config.json (gitignored)

### Key Files for AI Context

**For Understanding:**

1. This file (`claude.md`)
2. `lib/agent-base.js` - Core agent logic
3. `lib/tool-executor.js` - Command execution
4. `lib/platform-detector.js` - Platform/shell detection
5. `tools/registry.json` - Available tools
6. `prompts/*.md` - Agent instructions

**For Modification:**

1. `cli.js` - Adding new commands
2. `config/config.json` - Configuration changes
3. `tools/registry.json` - Adding new tools
4. `prompts/*.md` - Changing agent behavior
5. `lib/types/index.ts` - Type definitions

## Changelog & Version History

**v1.0.0** - Current

- Initial enterprise framework
- 6 specialized agents
- 58 tools integrated
- Cross-platform support
- ⚠️ TypeScript compilation broken
- ⚠️ Claude API mocked
- ⚠️ Security not integrated
- ⚠️ No tests

## Contributing

See `CONTRIBUTING.md` for full guidelines.

**Quick Start:**

1. Fork repository
2. Create feature branch
3. Make changes
4. Run `npm run lint && npm run format`
5. Submit pull request

**Before Submitting:**

- [ ] Code passes linting (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] TypeScript compiles (`npm run build`) - ⚠️ Currently fails
- [ ] Manual testing performed
- [ ] Documentation updated
- [ ] Commit messages clear

## Support & Contact

- **Documentation:** See `docs/` directory
- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Email:** contact@enterprise.com (if enterprise support)

## License

MIT License - See LICENSE file for details

---

**Last Updated:** 2025-11-19
**Audit Status:** Comprehensive deep-dive completed
**Documentation:** claude.md files created
**Next Steps:** Fix TypeScript errors, integrate Claude API, add security, implement tests
