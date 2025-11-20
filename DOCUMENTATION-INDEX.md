# 📚 Documentation Index

**Quick navigation to all Subagent CLI documentation**

---

## 🚀 Getting Started (Start Here!)

| Document | Description | When to Read |
|----------|-------------|--------------|
| **[QUICKSTART.md](QUICKSTART.md)** | **5-minute setup guide** | **First time using this project** |
| [README.md](README.md) | Project overview and features | Want to understand what this project does |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute | Want to contribute code or docs |

---

## 📖 Core Documentation

### Installation & Setup

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](QUICKSTART.md) | Fast 5-minute installation |
| [.env.example](.env.example) | Environment configuration template |
| [config/config.example.json](config/config.example.json) | Configuration file template |
| [scripts/verify-installation.js](scripts/verify-installation.js) | Installation verification script |

### Usage Guides

| Document | Purpose |
|----------|---------|
| [docs/USAGE.md](docs/USAGE.md) | Comprehensive usage guide |
| [examples/README.md](examples/README.md) | How to use example scripts |
| [TESTING.md](TESTING.md) | How to test the project |

### Implementation Guides

| Document | Purpose |
|----------|---------|
| [docs/IMPLEMENTATION-README.md](docs/IMPLEMENTATION-README.md) | Complete implementation guide |
| [docs/CLAUDE-ENTERPRISE-IMPLEMENTATION.md](docs/CLAUDE-ENTERPRISE-IMPLEMENTATION.md) | Enterprise architecture and patterns |
| [docs/TOOL-USE-IMPLEMENTATION.md](docs/TOOL-USE-IMPLEMENTATION.md) | Claude tool use best practices |

---

## 🤖 AI Model Documentation

| Document | Purpose |
|----------|---------|
| [docs/AI-MODEL-REVIEW.md](docs/AI-MODEL-REVIEW.md) | AI model comparison and selection guide |

---

## 🖥️ Platform References

### Operating Systems

| Platform | Document | Size |
|----------|----------|------|
| Windows | [docs/WINDOWS-REFERENCE.md](docs/WINDOWS-REFERENCE.md) | 24.4 KB |
| macOS | [docs/MACOS-REFERENCE.md](docs/MACOS-REFERENCE.md) | 18.2 KB |
| Linux | [docs/LINUX-REFERENCE.md](docs/LINUX-REFERENCE.md) | 22.7 KB |

### Scripting Languages

| Language | Document | Size |
|----------|----------|------|
| PowerShell & Batch | [docs/POWERSHELL-BATCH-SCRIPTS.md](docs/POWERSHELL-BATCH-SCRIPTS.md) | 18.3 KB |
| Python | [docs/PYTHON-SECURITY-TOOLS.md](docs/PYTHON-SECURITY-TOOLS.md) | 31.5 KB |
| Perl | [docs/PERL-SCRIPTS.md](docs/PERL-SCRIPTS.md) | 27.4 KB |

### Tools & References

| Topic | Document | Size |
|-------|----------|------|
| Scapy (Packet Analysis) | [docs/SCAPY-REFERENCE.md](docs/SCAPY-REFERENCE.md) | 26.3 KB |
| Regex & ASCII | [docs/REGEX-ASCII-REFERENCE.md](docs/REGEX-ASCII-REFERENCE.md) | 9.4 KB |

---

## 🎯 By Use Case

### "I want to get started NOW"
→ [QUICKSTART.md](QUICKSTART.md)

### "I want to understand what this does"
→ [README.md](README.md)

### "I'm having installation problems"
→ Run `npm run verify` and see [QUICKSTART.md](QUICKSTART.md#-troubleshooting)

### "I want to see examples"
→ [examples/README.md](examples/README.md)

### "I want to contribute"
→ [CONTRIBUTING.md](CONTRIBUTING.md)

### "I want to understand the architecture"
→ [docs/CLAUDE-ENTERPRISE-IMPLEMENTATION.md](docs/CLAUDE-ENTERPRISE-IMPLEMENTATION.md)

### "I need platform-specific help"
- Windows: [docs/WINDOWS-REFERENCE.md](docs/WINDOWS-REFERENCE.md)
- macOS: [docs/MACOS-REFERENCE.md](docs/MACOS-REFERENCE.md)
- Linux: [docs/LINUX-REFERENCE.md](docs/LINUX-REFERENCE.md)

### "I want to test everything works"
→ [TESTING.md](TESTING.md)

### "I found a bug"
→ [.github/ISSUE_TEMPLATE/bug_report.md](.github/ISSUE_TEMPLATE/bug_report.md)

### "I have a feature idea"
→ [.github/ISSUE_TEMPLATE/feature_request.md](.github/ISSUE_TEMPLATE/feature_request.md)

### "I want to choose an AI model"
→ [docs/AI-MODEL-REVIEW.md](docs/AI-MODEL-REVIEW.md)

---

## 📁 By Agent Type

### DevOps Agent
- Prompt: [prompts/devops.md](prompts/devops.md)
- Example: [examples/devops-example.sh](examples/devops-example.sh)
- Tools: Docker, Kubernetes, Terraform, Ansible, Jenkins

### Cloud Agent
- Prompt: [prompts/cloud.md](prompts/cloud.md)
- Example: [examples/cloud-example.ps1](examples/cloud-example.ps1)
- Tools: AWS CLI, Azure CLI, Google Cloud SDK

### Security Agent
- Prompt: [prompts/security.md](prompts/security.md)
- Reference: [docs/PYTHON-SECURITY-TOOLS.md](docs/PYTHON-SECURITY-TOOLS.md)
- Tools: Nmap, OpenSSL, security scanners

### Data Agent
- Prompt: [prompts/data.md](prompts/data.md)
- Tools: PostgreSQL, MySQL, MongoDB, Redis

### System Agent
- Prompt: [prompts/system.md](prompts/system.md)
- Examples:
  - macOS: [examples/macos-administration-example.sh](examples/macos-administration-example.sh)
  - Windows: [examples/windows-enumeration-example.ps1](examples/windows-enumeration-example.ps1)

### Code Agent
- Prompt: [prompts/code.md](prompts/code.md)
- Tools: npm, pip, maven, gradle, build systems

---

## 🛠️ Technical References

### Configuration Files

| File | Purpose |
|------|---------|
| [config/config.json](config/config.json) | Active configuration (do not commit if customized) |
| [config/config.example.json](config/config.example.json) | Configuration template (safe to commit) |
| [.env.example](.env.example) | Environment variables template |
| [tools/registry.json](tools/registry.json) | Tool definitions (58 tools) |

### Code Structure

| Directory | Contents |
|-----------|----------|
| [lib/](lib/) | Core TypeScript/JavaScript library |
| [lib/agents/](lib/agents/) | Agent implementations (SubagentOrchestrator) |
| [lib/tools/](lib/tools/) | Tool implementations (bash, code execution, text editor) |
| [lib/security/](lib/security/) | Security layer and validation |
| [lib/streaming/](lib/streaming/) | Claude streaming support |
| [lib/tracking/](lib/tracking/) | Cost and todo tracking |
| [lib/config/](lib/config/) | Enterprise configuration |
| [lib/types/](lib/types/) | TypeScript type definitions |
| [lib/prompts/](lib/prompts/) | Prompt templates |
| [prompts/](prompts/) | Agent system prompts (markdown) |
| [examples/](examples/) | Usage examples |
| [scripts/](scripts/) | Utility scripts |
| [docs/](docs/) | Documentation and reference guides |

### Example Files

| File | Purpose | Platform |
|------|---------|----------|
| [examples/devops-example.sh](examples/devops-example.sh) | DevOps tasks | Linux/macOS |
| [examples/cloud-example.ps1](examples/cloud-example.ps1) | Cloud operations | Windows |
| [examples/macos-administration-example.sh](examples/macos-administration-example.sh) | macOS admin | macOS |
| [examples/windows-enumeration-example.ps1](examples/windows-enumeration-example.ps1) | Windows enum | Windows |
| [examples/powershell-scripting-example.ps1](examples/powershell-scripting-example.ps1) | PowerShell | Windows |
| [examples/tool-definitions-example.js](examples/tool-definitions-example.js) | Tool schemas | All |

---

## 📊 Audit & Analysis Documents

| Document | Purpose |
|----------|---------|
| [docs/AUDIT-FINDINGS.md](docs/AUDIT-FINDINGS.md) | Deep dive audit findings (20 issues) |
| [docs/IMPROVEMENTS-SUMMARY.md](docs/IMPROVEMENTS-SUMMARY.md) | Documentation of all improvements made |
| [docs/CODE-QUALITY-REPORT.md](docs/CODE-QUALITY-REPORT.md) | Code quality analysis and recommendations |
| [docs/FINAL-REVIEW-SUMMARY.md](docs/FINAL-REVIEW-SUMMARY.md) | Complete review summary and metrics |

---

## 🔧 Developer Resources

### Contributing

| Resource | Purpose |
|----------|---------|
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md) | PR template |
| [.github/ISSUE_TEMPLATE/bug_report.md](.github/ISSUE_TEMPLATE/bug_report.md) | Bug report template |
| [.github/ISSUE_TEMPLATE/feature_request.md](.github/ISSUE_TEMPLATE/feature_request.md) | Feature request template |

### Testing

| Resource | Purpose |
|----------|---------|
| [TESTING.md](TESTING.md) | Comprehensive testing guide |
| [scripts/verify-installation.js](scripts/verify-installation.js) | Automated verification |
| [.github/workflows/ci.yml](.github/workflows/ci.yml) | CI/CD pipeline |

---

## 📏 Documentation Statistics

**Total Documentation:**
- Markdown files: 25
- Total size: ~300 KB
- Total lines: ~5,000+

**By Category:**
- Getting Started: 3 files
- Implementation: 3 files
- Platform References: 3 files
- Scripting References: 3 files
- Tool References: 2 files
- Examples: 7 files
- Meta/Audit: 3 files
- Contributing: 4 files

---

## 🗺️ Documentation Map (Visual)

```
subagent-cli-main/
│
├── 🚀 START HERE
│   ├── QUICKSTART.md ⭐⭐⭐ (5-min setup)
│   ├── README.md (overview)
│   └── .env.example (config template)
│
├── 📖 LEARN
│   ├── docs/USAGE.md (how to use)
│   ├── docs/IMPLEMENTATION-README.md (how to implement)
│   └── examples/README.md (examples guide)
│
├── 🏗️ IMPLEMENT
│   ├── docs/CLAUDE-ENTERPRISE-IMPLEMENTATION.md (architecture)
│   ├── docs/TOOL-USE-IMPLEMENTATION.md (tool patterns)
│   └── config/config.example.json (configuration)
│
├── 🖥️ PLATFORM SPECIFIC
│   ├── docs/WINDOWS-REFERENCE.md
│   ├── docs/MACOS-REFERENCE.md
│   └── docs/LINUX-REFERENCE.md
│
├── 🤖 AI & TOOLS
│   ├── docs/AI-MODEL-REVIEW.md (model selection)
│   └── tools/registry.json (58 tools)
│
├── 💻 EXAMPLES
│   ├── examples/devops-example.sh
│   ├── examples/cloud-example.ps1
│   └── examples/tool-definitions-example.js
│
├── 🧪 TESTING
│   ├── TESTING.md (test guide)
│   └── scripts/verify-installation.js
│
└── 🤝 CONTRIBUTING
    ├── CONTRIBUTING.md (guidelines)
    └── .github/ (templates)
```

---

## 🔍 Search Tips

**Looking for specific information? Try:**

- **Installation issues**: Search QUICKSTART.md for "troubleshooting"
- **Configuration options**: See config/config.example.json comments
- **Tool availability**: Run `npm run tools`
- **Agent capabilities**: Check prompts/*.md files
- **Code examples**: Browse examples/ directory
- **Error messages**: Search TESTING.md or create bug report
- **Best practices**: See docs/TOOL-USE-IMPLEMENTATION.md

---

## 📱 Quick Commands

```bash
# View this index
cat DOCUMENTATION-INDEX.md

# List all docs
find . -name "*.md" -type f

# Search all docs
grep -r "search term" docs/ *.md

# Count total documentation
find . -name "*.md" -exec wc -l {} + | tail -1

# Open in browser
open README.md  # macOS
xdg-open README.md  # Linux
start README.md  # Windows
```

---

## 🎓 Learning Path

**Recommended reading order for new users:**

1. [QUICKSTART.md](QUICKSTART.md) - Get it running
2. [README.md](README.md) - Understand the project
3. [docs/USAGE.md](docs/USAGE.md) - Learn to use it
4. [examples/README.md](examples/README.md) - See examples
5. [docs/IMPLEMENTATION-README.md](docs/IMPLEMENTATION-README.md) - Deep dive
6. [CONTRIBUTING.md](CONTRIBUTING.md) - Contribute back!

**Recommended reading order for developers:**

1. [QUICKSTART.md](QUICKSTART.md) - Setup environment
2. [docs/CLAUDE-ENTERPRISE-IMPLEMENTATION.md](docs/CLAUDE-ENTERPRISE-IMPLEMENTATION.md) - Architecture
3. [docs/TOOL-USE-IMPLEMENTATION.md](docs/TOOL-USE-IMPLEMENTATION.md) - Patterns
4. [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution workflow
5. [TESTING.md](TESTING.md) - Testing approach
6. Code in lib/ - Implementation details

---

## ❓ Still Can't Find What You Need?

1. **Search issues**: [GitHub Issues](https://github.com/enterprise/subagent-cli-main/issues)
2. **Ask a question**: Create issue with "question" label
3. **Check examples**: Browse [examples/](examples/)
4. **Read the code**: Check [lib/](lib/) for implementation

---

**Last Updated:** 2025-11-17
**Documentation Version:** 1.0.0
**Total Pages:** 25 markdown files

---

💡 **Tip:** Bookmark this page for quick navigation to all documentation!
