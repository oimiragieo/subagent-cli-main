# 🚀 Subagent CLI - 5-Minute Quickstart

Get up and running with Subagent CLI in 5 minutes or less!

---

## ⚡ Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js 14.0+** installed ([Download](https://nodejs.org/))
- ✅ **npm** (comes with Node.js)
- ✅ **Anthropic API Key** ([Get one here](https://console.anthropic.com/))

**Check your versions:**
```bash
node --version  # Should be v14.0.0 or higher
npm --version   # Should be 6.0.0 or higher
```

---

## 📥 Installation (4 steps)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/subagent-cli-main.git
cd subagent-cli-main

# Install dependencies
npm install
```

### Step 2: Set Up Environment Variables

```bash
# Copy the environment template
cp .env.example .env

# Edit .env and add your Anthropic API key
nano .env  # or use your favorite editor
```

**Required in `.env`:**
```bash
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

### Step 3: Configure (Optional)

The default configuration works out of the box! But if you want to customize:

```bash
# Copy the config template (already has sensible defaults)
cp config/config.example.json config/config.json

# Edit if you want to customize agents, tools, or security settings
nano config/config.json
```

### Step 4: Build TypeScript

```bash
# Compile TypeScript files
npm run build
```

---

## ✅ Verify Installation

Run these commands to verify everything works:

```bash
# Check system information
node cli.js info

# List available agents
node cli.js agents

# List available tools
node cli.js tools
```

**Expected output for `node cli.js agents`:**
```
=== Available Agents ===

devops ✓ enabled
  DevOps operations, CI/CD, containers, IaC

cloud ✓ enabled
  Cloud infrastructure (AWS, Azure, GCP)

security ✓ enabled
  Security audits, pen testing, compliance

...
```

---

## 🎯 Your First Agent Execution

Let's test the **System Agent** with a simple task:

```bash
node cli.js system "What is my current operating system and available disk space?"
```

This will:
1. ✨ Connect to Claude AI
2. 🤖 Load the System Agent
3. 🛠️ Execute platform detection and disk analysis
4. 📊 Return formatted results

---

## 🎨 Common Usage Patterns

### DevOps Agent
```bash
# Check Git repository status
node cli.js devops "Show me the git status and recent commits"

# Analyze Docker containers
node cli.js devops "List all running Docker containers with resource usage"
```

### Cloud Agent
```bash
# AWS operations (requires aws-cli installed)
node cli.js cloud "List all EC2 instances in us-east-1"

# Azure operations (requires az-cli installed)
node cli.js cloud "Show my Azure resource groups"
```

### Security Agent
```bash
# Port scanning (requires nmap)
node cli.js security "Scan localhost for open ports"

# Security audit
node cli.js security "Check for common security misconfigurations in this project"
```

### Data Agent
```bash
# Database operations
node cli.js data "Show PostgreSQL version and list databases"

# Data analysis
node cli.js data "Analyze the CSV file in ./data/sample.csv"
```

### Code Agent
```bash
# Code analysis
node cli.js code "Analyze the code quality in ./lib directory"

# Dependency check
node cli.js code "List all npm dependencies and check for updates"
```

---

## 🔧 Making It Easier (Optional)

### Create a Global Command

Instead of typing `node cli.js` every time:

```bash
# Install globally
npm link

# Now you can use:
subagent-cli agents
subagent-cli devops "your task"
```

### Create an Alias

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
alias subagent='node /path/to/subagent-cli-main/cli.js'

# Then use:
subagent agents
subagent devops "your task"
```

---

## 📚 Next Steps

Now that you're up and running:

1. **📖 Read [USAGE.md](docs/USAGE.md)** - Comprehensive usage examples
2. **🏗️ Read [IMPLEMENTATION-README.md](docs/IMPLEMENTATION-README.md)** - Advanced features
3. **🔒 Review [Security Best Practices](docs/CLAUDE-ENTERPRISE-IMPLEMENTATION.md#security)**
4. **🛠️ Explore [Tool Definitions](examples/tool-definitions-example.js)** - See all available tools
5. **🤝 Read [CONTRIBUTING.md](CONTRIBUTING.md)** - If you want to contribute

---

## ❓ Troubleshooting

### "Cannot find module 'commander'"

**Problem:** Dependencies not installed

**Solution:**
```bash
npm install
```

---

### "Error: ANTHROPIC_API_KEY is not set"

**Problem:** Environment variable not configured

**Solution:**
1. Make sure you created `.env` from `.env.example`
2. Add your actual API key to `.env`
3. Verify with: `cat .env | grep ANTHROPIC_API_KEY`

---

### "Platform not detected correctly"

**Problem:** Platform auto-detection failed

**Solution:**
Edit `config/config.json` and manually set:
```json
{
  "platform": "windows"  // or "macos" or "linux"
}
```

---

### "Tool not found: [toolname]"

**Problem:** Required CLI tool not installed on your system

**Solution:**
- **Docker:** [Install Docker](https://docs.docker.com/get-docker/)
- **AWS CLI:** [Install AWS CLI](https://aws.amazon.com/cli/)
- **Azure CLI:** [Install Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- **kubectl:** [Install kubectl](https://kubernetes.io/docs/tasks/tools/)

---

### "Permission denied" on Linux/macOS

**Problem:** CLI script not executable

**Solution:**
```bash
chmod +x cli.js
./cli.js info
```

---

### TypeScript Compilation Errors

**Problem:** TypeScript build fails

**Solution:**
```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

---

## 🔥 Quick Examples by Use Case

### "I want to deploy a container"
```bash
node cli.js devops "Build a Docker image from current directory and show me the build process"
```

### "I need to audit security"
```bash
node cli.js security "Perform a security audit of package.json dependencies"
```

### "I want to analyze system performance"
```bash
node cli.js system "Show me CPU, memory, and disk usage with top processes"
```

### "I need to query a database"
```bash
node cli.js data "Connect to PostgreSQL and show table schemas"
```

### "I want to refactor code"
```bash
node cli.js code "Suggest refactoring improvements for ./lib/agent-base.js"
```

---

## 💡 Pro Tips

1. **Start Simple:** Test with basic commands before complex workflows
2. **Check Tool Availability:** Run `node cli.js tools` to see what's available
3. **Use Verbose Mode:** Add `--verbose` for detailed execution logs
4. **Read Agent Prompts:** Check `prompts/*.md` to understand each agent's capabilities
5. **Monitor Costs:** Set `BUDGET_LIMIT` in `.env` to control API spending

---

## 📞 Getting Help

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/your-org/subagent-cli-main/issues)
- **Examples:** [examples/](examples/)
- **Community:** [Discord/Slack](your-link-here)

---

## ✨ Success Checklist

After completing this quickstart, you should be able to:

- ✅ Run `node cli.js info` successfully
- ✅ List all available agents
- ✅ Execute at least one agent task
- ✅ Understand where to find more documentation
- ✅ Know how to troubleshoot common issues

---

**🎉 You're ready to go! Start automating with AI agents!**

For advanced usage, see [USAGE.md](docs/USAGE.md) and [IMPLEMENTATION-README.md](docs/IMPLEMENTATION-README.md).
