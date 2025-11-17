# Examples Directory

This directory contains practical examples demonstrating how to use the Subagent CLI framework for various tasks.

## 📁 Available Examples

### Platform-Specific Examples

#### **devops-example.sh** (Linux/macOS)
Demonstrates DevOps agent capabilities:
- Docker container deployment
- Kubernetes orchestration
- Terraform infrastructure provisioning
- CI/CD pipeline execution
- Infrastructure monitoring

**Usage:**
```bash
cd examples/
chmod +x devops-example.sh
./devops-example.sh
```

---

#### **cloud-example.ps1** (Windows PowerShell)
Demonstrates Cloud agent capabilities:
- AWS resource management
- Azure infrastructure operations
- GCP service deployment
- Multi-cloud orchestration

**Usage:**
```powershell
cd examples
.\cloud-example.ps1
```

---

#### **macos-administration-example.sh** (macOS)
Demonstrates macOS-specific system administration:
- Homebrew package management
- System preferences configuration
- Service management with launchctl
- macOS security settings
- Disk and filesystem operations

**Usage:**
```bash
cd examples/
chmod +x macos-administration-example.sh
./macos-administration-example.sh
```

---

#### **windows-enumeration-example.ps1** (Windows)
Demonstrates Windows system enumeration:
- System information gathering
- Network configuration analysis
- Service enumeration
- User and group analysis
- Security policy review

**Usage:**
```powershell
cd examples
.\windows-enumeration-example.ps1
```

---

#### **powershell-scripting-example.ps1** (Windows)
Advanced PowerShell scripting examples:
- Active Directory operations
- Registry management
- WMI queries
- Remote management
- Automation workflows

**Usage:**
```powershell
cd examples
.\powershell-scripting-example.ps1
```

---

### Reference Examples

#### **tool-definitions-example.js** (40+ KB)
Comprehensive reference for defining tools in the Subagent CLI framework:
- Complete tool definition schemas
- Real-world tool configurations for 50+ CLI tools
- Platform-specific tool variations
- Agent-to-tool mappings
- Best practices and patterns

**Usage:**
```javascript
// Import and reference in your own agent implementations
const toolExamples = require('./examples/tool-definitions-example.js');
```

**What's Inside:**
- DevOps tools (Docker, Kubernetes, Terraform, Ansible, etc.)
- Cloud tools (AWS CLI, Azure CLI, GCP SDK)
- Security tools (Nmap, OpenSSL, vulnerability scanners)
- Data tools (PostgreSQL, MySQL, MongoDB, Redis)
- System tools (package managers, process managers, monitors)
- Development tools (npm, pip, maven, gradle, compilers)

---

## 🚀 Quick Start

### Run a Single Example

```bash
# DevOps example
cd examples/
node ../cli.js devops "Build Docker image from current directory"

# Cloud example (Windows)
cd examples
node ..\cli.js cloud "List all AWS EC2 instances"

# System administration (macOS)
cd examples/
node ../cli.js system "Show disk usage for all volumes"
```

### Run All Examples in a Category

```bash
# Run all DevOps examples
./devops-example.sh

# Run all Cloud examples (Windows)
.\cloud-example.ps1
```

---

## 📋 Prerequisites

Before running examples, ensure:

1. **Subagent CLI is installed and configured**
   ```bash
   npm install
   npm run build
   npm run verify
   ```

2. **Environment variables are set**
   - `ANTHROPIC_API_KEY` configured in `.env`
   - See `.env.example` for all options

3. **Required tools are installed** (depending on example)
   - Docker (for container examples)
   - kubectl (for Kubernetes examples)
   - Terraform (for IaC examples)
   - AWS CLI / Azure CLI / gcloud (for cloud examples)
   - Platform-specific tools (Homebrew on macOS, etc.)

**Check tool availability:**
```bash
npm run tools
```

---

## 🎯 Example Categories

### By Agent Type

| Agent | Example Files | Focus Area |
|-------|--------------|------------|
| DevOps | `devops-example.sh` | CI/CD, containers, IaC |
| Cloud | `cloud-example.ps1` | AWS, Azure, GCP operations |
| System | `macos-administration-example.sh`, `windows-enumeration-example.ps1` | OS administration |
| Security | *(Integrated in tool definitions)* | Vulnerability scanning, auditing |
| Data | *(Integrated in tool definitions)* | Database operations, ETL |
| Code | *(Integrated in tool definitions)* | Development, testing, builds |

### By Platform

| Platform | Example Files |
|----------|--------------|
| **Linux** | `devops-example.sh` |
| **macOS** | `macos-administration-example.sh`, `devops-example.sh` |
| **Windows** | `cloud-example.ps1`, `windows-enumeration-example.ps1`, `powershell-scripting-example.ps1` |
| **Cross-Platform** | `tool-definitions-example.js` |

---

## 💡 How to Use These Examples

### 1. **Learning Mode** - Study the Examples
Read through the example files to understand:
- How to structure agent commands
- What tasks each agent can perform
- Platform-specific considerations
- Best practices for tool usage

### 2. **Testing Mode** - Run the Examples
Execute examples to verify:
- Your installation is working correctly
- Required tools are available
- Agent responses are accurate
- Performance is acceptable

### 3. **Development Mode** - Adapt the Examples
Copy and modify examples for your needs:
```bash
# Copy an example
cp devops-example.sh my-custom-devops.sh

# Modify for your use case
nano my-custom-devops.sh

# Run your customized example
chmod +x my-custom-devops.sh
./my-custom-devops.sh
```

### 4. **Reference Mode** - Use as Documentation
Refer to `tool-definitions-example.js` when:
- Adding new tools to the registry
- Understanding tool schemas
- Configuring agent capabilities
- Implementing custom integrations

---

## 🔧 Troubleshooting

### Example Scripts Fail to Run

**Problem:** Permission denied on Linux/macOS

**Solution:**
```bash
chmod +x examples/*.sh
```

---

**Problem:** Cannot find module '../cli.js'

**Solution:** Make sure you're running from the examples/ directory:
```bash
cd examples/
./devops-example.sh
```

---

**Problem:** Tool not found (e.g., Docker, kubectl)

**Solution:** Install the required tool or skip examples requiring it:
```bash
# Check which tools are available
npm run tools

# Install missing tools
# macOS: brew install docker kubectl
# Linux: apt-get install docker.io kubectl
# Windows: choco install docker-desktop kubernetes-cli
```

---

### Agent Execution Fails

**Problem:** ANTHROPIC_API_KEY not set

**Solution:**
```bash
# Check if .env exists
cat .env | grep ANTHROPIC_API_KEY

# If not set, add it
echo "ANTHROPIC_API_KEY=your-key-here" >> .env
```

---

**Problem:** Model rate limits or errors

**Solution:** Check your Anthropic account:
- API key is valid
- Account has sufficient credits
- Rate limits not exceeded

---

## 📚 Additional Resources

- **[QUICKSTART.md](../QUICKSTART.md)** - 5-minute setup guide
- **[USAGE.md](../docs/USAGE.md)** - Comprehensive usage documentation
- **[Tool Registry](../tools/registry.json)** - Complete tool definitions
- **[Agent Prompts](../prompts/)** - System prompts for each agent

---

## 🤝 Contributing Examples

Have a useful example to share? We'd love to include it!

**Guidelines:**
1. Make examples self-contained and well-commented
2. Include prerequisites at the top of the file
3. Use relative paths to cli.js
4. Test on target platform before submitting
5. Add entry to this README

See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

---

## 📝 Example Template

Creating your own example? Use this template:

```bash
#!/bin/bash

# [Agent Name] Agent Example Usage
# Description of what this example demonstrates
# Prerequisites: List required tools

echo "=== [Example Category] Examples ==="
echo ""

# Example 1: [Description]
echo "Example 1: [Task name]"
node ../cli.js [agent] "[Task description]"
echo ""

# Example 2: [Description]
echo "Example 2: [Task name]"
node ../cli.js [agent] "[Task description]"
echo ""

# Add more examples as needed
```

---

**Happy automating with Subagent CLI!** 🚀

For questions or issues, see the main [README.md](../README.md) or open an issue on GitHub.
