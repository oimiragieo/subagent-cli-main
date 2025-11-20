# Subagent CLI - Enterprise AI Agent Framework

A TypeScript/JavaScript framework for building specialized AI agents powered by Claude AI. Features streaming responses, parallel tool execution, cost tracking, and enterprise-grade security.

## 🚀 Overview

This framework provides a robust foundation for creating and orchestrating specialized AI agents:

- **Multi-Agent Orchestration**: Execute tasks with specialized agents in parallel or sequentially
- **Streaming Responses**: Real-time streaming of Claude API responses
- **Enterprise Security**: Command validation, audit logging, and configurable safety controls
- **Cost Tracking**: Monitor API usage and enforce budget limits
- **Tool Integration**: Extensible tool system for file operations, bash commands, and code execution
- **Cross-Platform**: Supports Windows (PowerShell, cmd), macOS (bash, zsh), Linux (bash)
- **TypeScript & JavaScript**: Modern TypeScript core with JavaScript compatibility layer

## 🤖 Specialized Agents

The framework includes 6 pre-configured enterprise agents in `lib/agents/subagent-orchestrator.ts`:

### 1. **Security Auditor**
- OWASP Top 10 vulnerability assessment
- Secure coding practices review
- Authentication & authorization analysis
- Compliance checks (SOC2, GDPR, HIPAA, PCI-DSS)
- Security findings with CVSS scoring

### 2. **Test Engineer**
- Unit, integration, and e2e test generation
- Test coverage analysis
- Performance benchmarking
- Security test cases
- CI/CD integration

### 3. **Documentation Writer**
- Technical documentation creation
- API documentation
- Architecture diagrams
- User guides and tutorials
- README and getting started guides

### 4. **Performance Optimizer**
- Algorithm complexity analysis
- Database query optimization
- Caching strategies
- Resource utilization profiling
- Scalability recommendations

### 5. **Code Reviewer**
- Code quality assessment
- SOLID principles validation
- Design pattern analysis
- Security review
- Refactoring suggestions

### 6. **Data Analyst**
- Statistical analysis
- Data quality assessment
- Pattern identification
- Visualizations and insights
- Business recommendations

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd subagent-cli-main

# Install dependencies
npm install

# Build TypeScript files
npm run build

# Set up environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# (Optional) Copy and customize configuration
cp config/config.example.json config/config.json

# Verify installation
npm run verify
```

**Quick Start:** See [QUICKSTART.md](QUICKSTART.md) for a 5-minute setup guide!

## 🔧 Configuration

Edit `config/config.json` to set your preferences:

```json
{
  "platform": "auto",
  "defaultShell": "powershell",
  "agents": {
    "devops": { "enabled": true },
    "security": { "enabled": true },
    "cloud": { "enabled": true },
    "data": { "enabled": true },
    "system": { "enabled": true },
    "code": { "enabled": true }
  },
  "tools": {
    "allowList": ["*"],
    "denyList": []
  }
}
```

## 💻 Usage

### CLI Usage

The CLI (`cli.js`) provides a simple interface to the agent framework:

```bash
# Display system and platform information
node cli.js info

# List available agents
node cli.js agents

# List available tools
node cli.js tools

# Run an agent with a task
node cli.js devops "Deploy application to Kubernetes"
node cli.js security "Scan network for vulnerabilities"
node cli.js cloud "Create AWS S3 bucket with encryption"

# Interactive mode
node cli.js interactive

# With global installation (after npm link)
subagent-cli devops "Build and deploy"
subagent-cli info
```

### Programmatic Usage (TypeScript)

Use the SubagentOrchestrator for advanced multi-agent workflows:

```typescript
import { SubagentOrchestrator } from './lib/agents/subagent-orchestrator';

const orchestrator = new SubagentOrchestrator({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

// Execute with a single specialized agent
const result = await orchestrator.executeWithSubagent(
  "security-auditor",
  "Audit this authentication code for vulnerabilities"
);

console.log(result.result);

// Execute multiple agents in parallel
const results = await orchestrator.executeParallel([
  { agent: "security-auditor", task: "Audit authentication" },
  { agent: "test-engineer", task: "Write unit tests" },
  { agent: "documentation-writer", task: "Document API endpoints" }
]);

// Get execution statistics
const stats = orchestrator.getStatistics();
console.log(`Completed: ${stats.completedExecutions}`);
```

### Environment Variables

Required environment variables (set in `.env`):

```bash
# Required
ANTHROPIC_API_KEY=your-api-key-here

# Optional
LOG_LEVEL=info
DEFAULT_MODEL=claude-sonnet-4-5
BUDGET_LIMIT=100.00
MAX_RETRIES=3
```

## 🛠 Tool System

The framework includes a flexible tool system with 58+ predefined tools in `tools/registry.json`:

### Built-in Tools

**File Operations:**
- Read, Write, Edit files
- Glob pattern matching
- Directory operations

**Command Execution:**
- Bash command execution
- PowerShell (Windows)
- Cross-platform shell support

**Code Execution:**
- Sandboxed code execution
- Python, JavaScript, and more
- Output capture and error handling

**Search & Analysis:**
- Grep for code search
- Pattern matching
- Log analysis

### Tool Registry

The tool registry (`tools/registry.json`) defines available CLI tools across categories:

- **DevOps**: Docker, Kubernetes, Terraform, Ansible, Git
- **Cloud**: AWS CLI, Azure CLI, Google Cloud SDK
- **Security**: Nmap, security scanners, compliance tools
- **Data**: PostgreSQL, MySQL, MongoDB, Redis
- **System**: System utilities, monitoring, logging
- **Development**: npm, pip, maven, gradle, build tools

### Platform Detection

The framework automatically detects the platform and available shells:
- **Windows**: PowerShell, cmd
- **macOS**: bash, zsh
- **Linux**: bash, sh

Tools are validated for availability before execution, with version detection and graceful fallbacks.

## 🏗 Architecture

```
subagent-cli-main/
├── lib/                           # Core TypeScript/JavaScript library
│   ├── agents/                    # Agent implementations
│   │   └── subagent-orchestrator.ts  # Multi-agent orchestration
│   ├── streaming/                 # Streaming support
│   │   └── streaming-agent.ts     # Claude streaming client
│   ├── tools/                     # Tool implementations
│   │   ├── bash-tool.ts           # Bash command execution
│   │   ├── code-execution-tool.ts # Code execution sandbox
│   │   └── text-editor-tool.ts    # File editing operations
│   ├── security/                  # Security layer
│   │   └── security-layer.ts      # Command validation & audit
│   ├── tracking/                  # Usage tracking
│   │   ├── cost-tracker.ts        # API cost monitoring
│   │   └── todo-tracker.ts        # Task tracking
│   ├── config/                    # Configuration management
│   │   └── enterprise-config.ts   # Enterprise settings
│   ├── types/                     # TypeScript type definitions
│   │   └── index.ts              # Shared types
│   ├── prompts/                   # Prompt templates
│   │   └── prompt-templates.ts   # System prompts
│   ├── agent-base.js             # Base agent class
│   ├── platform-detector.js      # Platform detection
│   └── tool-executor.js          # Tool execution engine
├── prompts/                       # Agent system prompts (markdown)
│   ├── devops.md
│   ├── cloud.md
│   ├── security.md
│   ├── data.md
│   ├── system.md
│   └── code.md
├── tools/                         # Tool registry
│   ├── platform/                  # Platform-specific tools
│   └── registry.json             # Tool definitions (58 tools)
├── config/                        # Configuration files
│   ├── config.json               # Active config (git-ignored)
│   └── config.example.json       # Config template
├── docs/                         # Documentation
├── examples/                     # Usage examples
├── scripts/                      # Utility scripts
└── cli.js                        # CLI entry point
```

## ✨ Key Features

### Streaming & Real-time Responses
- Real-time streaming of Claude API responses
- Token-by-token output for immediate feedback
- Interrupt and resume support

### Cost Management
- Real-time API cost tracking
- Budget limits and alerts
- Usage attribution per agent
- Cost estimation before execution

### Security & Safety
- Command validation and blocklisting
- Audit logging for all operations
- Configurable safety controls
- Path validation and sandboxing
- Secrets redaction

### Developer Experience
- TypeScript type safety
- Comprehensive error handling
- Detailed execution logging
- Progress tracking with TodoTracker
- Hot-reload configuration

## 🔒 Security

The framework includes enterprise-grade security features:

- **Command Validation**: Blocklisting and allowlisting of commands
- **Audit Logging**: Complete audit trail of all operations in `lib/security/security-layer.ts`
- **Path Validation**: Prevent directory traversal and unauthorized file access
- **Secrets Management**: Automatic redaction of sensitive data
- **Sandboxed Execution**: Isolated execution environments for untrusted code
- **Configurable Controls**: Fine-grained security settings in `config/config.json`

## 📚 Documentation

### Quick Start
- **[Quickstart Guide](QUICKSTART.md)** - 🚀 Get running in 5 minutes
- **[Documentation Index](DOCUMENTATION-INDEX.md)** - Complete documentation navigation
- [Usage Guide](docs/USAGE.md) - Comprehensive usage examples
- [Contributing Guide](CONTRIBUTING.md) - Contribution guidelines

### Implementation Guides
- **[Implementation README](docs/IMPLEMENTATION-README.md)** - Complete implementation guide
- [Claude Enterprise Implementation](docs/CLAUDE-ENTERPRISE-IMPLEMENTATION.md) - Architecture and patterns
- [Tool Use Implementation](docs/TOOL-USE-IMPLEMENTATION.md) - Claude tool use best practices
- [Tool Definitions Examples](examples/tool-definitions-example.js) - Production-ready tool definitions

### Platform References
- [Windows Reference](docs/WINDOWS-REFERENCE.md) - Windows OS reference
- [macOS Reference](docs/MACOS-REFERENCE.md) - macOS administration
- [Linux Reference](docs/LINUX-REFERENCE.md) - Linux system reference

### Scripting References
- [PowerShell & Batch Scripts](docs/POWERSHELL-BATCH-SCRIPTS.md) - PowerShell scripting
- [Python Security Tools](docs/PYTHON-SECURITY-TOOLS.md) - Python automation
- [Scapy Reference](docs/SCAPY-REFERENCE.md) - Packet crafting
- [Perl Scripts](docs/PERL-SCRIPTS.md) - Perl system administration
- [Regex & ASCII Reference](docs/REGEX-ASCII-REFERENCE.md) - Regular expressions

### Testing & Quality
- [Testing Guide](TESTING.md) - Comprehensive testing guide
- [Code Quality Report](docs/CODE-QUALITY-REPORT.md) - Quality analysis
- [Audit Findings](docs/AUDIT-FINDINGS.md) - Security audit results

### AI & Tools
- [AI Model Review](docs/AI-MODEL-REVIEW.md) - AI tool comparison and selection

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

- Documentation: [docs/](docs/)
- Issues: GitHub Issues
- Enterprise Support: contact@enterprise.com
