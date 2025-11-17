# Enterprise AI Agent CLI Framework

A comprehensive multi-agent CLI framework designed for enterprise use with maximum tool integration across Windows, macOS, and Linux platforms.

## 🚀 Overview

This framework provides specialized AI agents that can execute complex tasks using a wide array of CLI tools across different platforms:

- **Cross-Platform Support**: Windows (PowerShell, cmd), macOS (bash, zsh), Linux (bash)
- **Enterprise-Ready**: Built for production environments with security and compliance in mind
- **Multi-Agent Architecture**: Specialized agents for different domains with parallel execution
- **Maximum Tool Integration**: Supports 50+ CLI tools out of the box
- **Claude-Powered**: Leverages Claude's advanced AI capabilities with streaming, tool use, and fine-grained control
- **Cost Management**: Real-time budget tracking and enforcement with multi-tenant attribution
- **Security-First**: Command blocklisting, path validation, audit logging, and container isolation

## 🤖 Available Agents

### 1. **DevOps Agent** (`agents/devops`)
- CI/CD pipeline management (Jenkins, GitHub Actions, Azure DevOps)
- Container orchestration (Docker, Kubernetes)
- Infrastructure as Code (Terraform, Ansible, CloudFormation)
- Monitoring and logging (Prometheus, Grafana, ELK)

### 2. **Security Agent** (`agents/security`)
- Vulnerability scanning (Nmap, Nessus, OpenVAS)
- Penetration testing (Metasploit, Burp Suite)
- Security compliance (CIS benchmarks, STIG)
- Threat analysis and incident response

### 3. **Cloud Agent** (`agents/cloud`)
- AWS operations (aws-cli, CloudFormation, CDK)
- Azure management (az-cli, ARM templates)
- GCP administration (gcloud, deployment-manager)
- Multi-cloud orchestration

### 4. **Data Agent** (`agents/data`)
- Database operations (PostgreSQL, MySQL, MongoDB, Redis)
- ETL pipelines (Apache Airflow, dbt)
- Data analysis (pandas, SQL, BigQuery)
- Data quality and validation

### 5. **System Agent** (`agents/system`)
- System administration (user management, services)
- Performance monitoring (top, htop, perfmon)
- Log analysis and troubleshooting
- Backup and recovery operations

### 6. **Code Agent** (`agents/code`)
- Code analysis and refactoring
- Test generation and execution
- Dependency management (npm, pip, maven, nuget)
- Build systems (make, gradle, msbuild)

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

### Basic Usage

```bash
# Run a specific agent
node cli.js devops "Deploy application to Kubernetes"
node cli.js security "Scan network for vulnerabilities"
node cli.js cloud "Create AWS S3 bucket with encryption"

# List available agents
node cli.js agents

# List available tools
node cli.js tools

# Display system information
node cli.js info

# With global installation (after npm link)
subagent-cli devops "Build and deploy"
subagent-cli system "Check disk usage"
```

### Environment Variables

Required environment variables (set in `.env`):

```bash
# Required
ANTHROPIC_API_KEY=your-api-key-here

# Optional
LOG_LEVEL=info
DEFAULT_MODEL=claude-sonnet-4.5
BUDGET_LIMIT=100
```

## 🛠 Supported Tools

### DevOps Tools
- Docker, Docker Compose, Podman
- Kubernetes (kubectl, helm, k9s)
- Terraform, Ansible, Puppet, Chef
- Jenkins, GitHub Actions, GitLab CI, Azure DevOps
- Git, SVN

### Cloud Tools
- AWS CLI, AWS CDK, CloudFormation
- Azure CLI, Azure PowerShell, ARM
- Google Cloud SDK (gcloud)
- Cloud providers APIs

### Security Tools
- Nmap, Nessus, OpenVAS
- Metasploit Framework
- OWASP ZAP, Burp Suite
- Snort, Suricata
- ClamAV, Lynis

### Data Tools
- PostgreSQL (psql), MySQL, MongoDB
- Redis, Elasticsearch
- Apache Spark, Hadoop
- dbt, Apache Airflow
- Pandas, NumPy

### System Tools
- PowerShell (Windows, Core)
- Bash, Zsh (Unix/Linux/macOS)
- cmd.exe (Windows)
- systemctl, service
- Performance Monitor, Task Manager
- grep, awk, sed, jq
- curl, wget, Invoke-WebRequest

### Development Tools
- npm, yarn, pnpm
- pip, poetry, conda
- maven, gradle
- dotnet, msbuild
- make, cmake
- pytest, jest, mocha

## 🏗 Architecture

```
subagent-cli-main/
├── agents/                  # Agent implementations
│   ├── devops/
│   ├── security/
│   ├── cloud/
│   ├── data/
│   ├── system/
│   └── code/
├── prompts/                 # System prompts for each agent
│   └── [agent-name].md
├── tools/                   # Tool integrations
│   ├── platform/           # Platform-specific tools
│   ├── cross-platform/     # Cross-platform tools
│   └── registry.json       # Tool registry
├── lib/                    # Core library
│   ├── agent-base.js
│   ├── tool-executor.js
│   └── platform-detector.js
├── config/                 # Configuration
│   └── config.json
├── examples/              # Usage examples
└── tests/                # Test suites
```

## 🔒 Security

- All agents run with principle of least privilege
- Tool execution requires explicit approval
- Audit logging for all operations
- Secrets management integration (Azure Key Vault, AWS Secrets Manager)
- Support for enterprise SSO and MFA

## 📚 Documentation

### AI Model Selection & Integration
- **[AI Model Review & Selection Guide](docs/AI-MODEL-REVIEW.md) - 🧠 AI tool comparison and selection guide**
  - Compare Gemini, Claude, Codex, Cursor, Copilot, and Droid
  - Decision trees and role-based recommendations
  - Security postures, output formats, and CI/CD integration patterns
  - Cost and performance benchmarks

### Platform References
- [Windows Reference](docs/WINDOWS-REFERENCE.md) - Complete Windows OS reference guide
- [macOS Reference](docs/MACOS-REFERENCE.md) - Complete macOS administration reference
- [Linux Reference](docs/LINUX-REFERENCE.md) - Complete Linux system reference

### Scripting and Automation
- [PowerShell & Batch Scripts](docs/POWERSHELL-BATCH-SCRIPTS.md) - PowerShell and Batch scripting reference
- [Python Security Tools](docs/PYTHON-SECURITY-TOOLS.md) - Python network and automation scripts
- [Scapy Reference](docs/SCAPY-REFERENCE.md) - Packet crafting and network analysis with Scapy
- [Perl Scripts](docs/PERL-SCRIPTS.md) - Perl network and system administration scripts
- [Regex & ASCII Reference](docs/REGEX-ASCII-REFERENCE.md) - Regular expressions and ASCII table

### Enterprise Implementation
- **[Implementation README](docs/IMPLEMENTATION-README.md) - 🎯 START HERE - Complete implementation guide**
- [Claude Enterprise Implementation](docs/CLAUDE-ENTERPRISE-IMPLEMENTATION.md) - Comprehensive architecture and code patterns
- [Tool Use Implementation](docs/TOOL-USE-IMPLEMENTATION.md) - Claude tool use best practices and patterns
- [Tool Definitions Examples](examples/tool-definitions-example.js) - Production-ready tool definitions for all agents

### Getting Started
- **[Quickstart Guide](QUICKSTART.md) - 🚀 START HERE - Get running in 5 minutes**
- [Usage Guide](docs/USAGE.md) - Comprehensive usage guide with examples
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

- Documentation: [docs/](docs/)
- Issues: GitHub Issues
- Enterprise Support: contact@enterprise.com
