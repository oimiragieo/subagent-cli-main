# prompts/ Directory - Agent System Prompts

## Purpose

Contains markdown files that define the behavior, expertise, and tool usage for each specialized agent. These prompts are loaded at agent initialization and sent to Claude as the system message.

## Files

```
prompts/
├── system.md      # ✅ System administration agent
├── devops.md      # ✅ DevOps operations agent
├── cloud.md       # ✅ Cloud infrastructure agent
├── security.md    # ✅ Security auditing agent
├── data.md        # ✅ Data engineering agent
└── code.md        # ✅ Software development agent
```

## Prompt Structure

Each prompt file follows this pattern:

```markdown
# [Agent Name] - System Prompt

## Role and Identity
[Define the agent's expertise and specialization]

## Core Responsibilities
- [Responsibility 1]
- [Responsibility 2]
- [...]

## Available Tools and Usage
### [Tool Category]
#### [Tool Name]
[Usage examples, commands, best practices]

## Best Practices
[Guidelines for safe and effective operations]

## Safety Guidelines
[Security considerations and restrictions]
```

## Loading Mechanism

```javascript
// In agent-base.js:
async loadSystemPrompt() {
  const promptPath = path.join(__dirname, '..', 'prompts', `${this.type}.md`);
  this.systemPrompt = await fs.readFile(promptPath, 'utf8');
}
```

**Agent Type Mapping:**
- `devops` → `prompts/devops.md`
- `cloud` → `prompts/cloud.md`
- `security` → `prompts/security.md`
- `data` → `prompts/data.md`
- `system` → `prompts/system.md`
- `code` → `prompts/code.md`

## Prompt Details

### system.md

**Focus:** System administration, performance monitoring, troubleshooting

**Key Sections:**
- Linux system administration (systemd, processes, users)
- macOS administration (launchd, disk utility, profiles)
- Windows administration (services, registry, PowerShell)
- Performance monitoring (top, htop, perfmon)
- Log analysis and troubleshooting
- System automation and scripting

**References:**
- Points to `docs/LINUX-REFERENCE.md`
- Points to `docs/MACOS-REFERENCE.md`
- Points to `docs/WINDOWS-REFERENCE.md`

### devops.md

**Focus:** CI/CD, containers, infrastructure as code

**Key Sections:**
- Container management (Docker, Kubernetes, Helm)
- Infrastructure as Code (Terraform, Ansible, CloudFormation)
- CI/CD pipelines (Jenkins, GitHub Actions, GitLab CI)
- Build systems (make, gradle, msbuild)
- Version control (Git, SVN)
- Monitoring and logging

### cloud.md

**Focus:** Multi-cloud infrastructure management

**Key Sections:**
- AWS CLI operations (EC2, S3, Lambda, CloudFormation)
- Azure management (az-cli, VMs, App Service, Key Vault)
- Google Cloud SDK (Compute Engine, Cloud Functions)
- Multi-cloud orchestration
- Infrastructure provisioning
- Cloud security best practices

### security.md

**Focus:** Security auditing, penetration testing, compliance

**Key Sections:**
- Vulnerability scanning (Nmap, Nessus, OpenVAS)
- Penetration testing (Metasploit, Burp Suite)
- Compliance checking (CIS benchmarks, STIG)
- Security automation
- Network analysis
- Incident response

**References:**
- Points to `docs/PYTHON-SECURITY-TOOLS.md`
- Points to `docs/SCAPY-REFERENCE.md`

### data.md

**Focus:** Data engineering, databases, ETL pipelines

**Key Sections:**
- Database operations (PostgreSQL, MySQL, MongoDB, Redis)
- ETL pipelines (Apache Airflow, dbt)
- Data analysis (pandas, SQL, BigQuery)
- Data quality validation
- Data warehousing
- Stream processing

### code.md

**Focus:** Software development, testing, builds

**Key Sections:**
- Code analysis and refactoring
- Test generation and execution (pytest, jest, mocha)
- Dependency management (npm, pip, maven, nuget)
- Build automation (make, gradle, msbuild)
- Code quality tools (ESLint, Prettier, SonarQube)
- Version control best practices

## Modification Guidelines

### Adding New Content

1. Keep markdown format consistent
2. Add practical examples with commands
3. Include platform-specific variations
4. Reference external documentation when appropriate
5. Add safety warnings for destructive operations

### Best Practices for Prompts

✅ **DO:**
- Be specific about tool usage
- Include concrete examples
- Mention platform differences
- Add security warnings
- Reference detailed docs in `docs/`
- Keep instructions clear and actionable

❌ **DON'T:**
- Make prompts too generic
- Forget platform-specific commands
- Skip safety guidelines
- Assume tools are available
- Include outdated information

## Integration with Tool Registry

Prompts reference tools from `tools/registry.json`. When an agent initializes:

1. Loads its system prompt from `prompts/{type}.md`
2. Loads tools from `tools/registry.json` where `agents` includes its type
3. Detects which tools are actually available on the system
4. Sends prompt + available tools to Claude API

## AI Assistant Usage

When modifying prompts, remember:
- These are loaded as Claude system messages
- Keep them focused on the agent's specialty
- Include enough detail for Claude to use tools effectively
- Reference platform-specific documentation
- Test changes by running the agent

---

**Last Updated:** 2025-11-19
