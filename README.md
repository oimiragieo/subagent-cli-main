# Enterprise AI Agent CLI Framework

A comprehensive multi-agent CLI framework designed for enterprise use with maximum tool integration across Windows, macOS, and Linux platforms.

## 🚀 Overview

This framework provides specialized AI agents that can execute complex tasks using a wide array of CLI tools across different platforms:

- **Cross-Platform Support**: Windows (PowerShell, cmd), macOS (bash, zsh), Linux (bash)
- **Enterprise-Ready**: Built for production environments with security and compliance in mind
- **Multi-Agent Architecture**: Specialized agents for different domains
- **Maximum Tool Integration**: Supports 50+ CLI tools out of the box

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
# or
pip install -r requirements.txt

# Configure your environment
cp config/config.example.json config/config.json
```

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
./subagent-cli devops "Deploy application to Kubernetes"
./subagent-cli security "Scan network for vulnerabilities"
./subagent-cli cloud "Create AWS S3 bucket with encryption"

# Interactive mode
./subagent-cli --interactive

# Specify platform
./subagent-cli --platform windows devops "Build and deploy"
./subagent-cli --platform macos system "Check disk usage"
```

### PowerShell Integration

```powershell
# Import the module
Import-Module .\modules\SubagentCLI.psm1

# Use PowerShell cmdlets
Invoke-DevOpsAgent -Task "Deploy to production"
Invoke-CloudAgent -Task "List all EC2 instances" -Provider AWS
```

### Python Integration

```python
from subagent_cli import DevOpsAgent, CloudAgent

# Initialize agent
devops = DevOpsAgent()
result = devops.execute("Build Docker image and push to registry")

# Use with context
with CloudAgent(provider='aws') as agent:
    agent.execute("Create VPC with public and private subnets")
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

- [Usage Guide](docs/USAGE.md) - Comprehensive usage guide with examples
- [Windows Reference](docs/WINDOWS-REFERENCE.md) - Complete Windows OS reference guide
- [PowerShell & Batch Scripts](docs/POWERSHELL-BATCH-SCRIPTS.md) - PowerShell and Batch scripting reference
- [Agent Development Guide](docs/agent-development.md)
- [Tool Integration Guide](docs/tool-integration.md)
- [Platform Support](docs/platform-support.md)
- [Best Practices](docs/best-practices.md)
- [API Reference](docs/api-reference.md)

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

- Documentation: [docs/](docs/)
- Issues: GitHub Issues
- Enterprise Support: contact@enterprise.com
