# tools/ Directory - Tool Registry

## Purpose

Defines all available CLI tools that agents can use, with metadata about platforms, categories, and usage patterns.

## Structure

```
tools/
├── registry.json       # ✅ Main tool registry (58 tools)
└── platform/          # Platform-specific tool definitions (future)
```

## registry.json

**Status:** ✅ Complete with 58 tools
**Version:** 1.0.0

### Format

```json
{
  "version": "1.0.0",
  "description": "Comprehensive tool registry for enterprise AI agents",
  "platforms": ["windows", "macos", "linux", "unix"],
  "categories": [
    "devops", "cloud", "security", "data",
    "system", "code", "networking", "monitoring"
  ],
  "tools": [
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
  ]
}
```

### Tool Properties

- **name** (string): Unique tool identifier
- **command** (string): CLI command to execute
- **description** (string): What the tool does
- **category** (string): Tool category (devops, cloud, etc.)
- **platforms** (array): Supported platforms
- **agents** (array): Which agents can use it (`"*"` = all agents)
- **versionCommand** (string): Flag to get version (e.g., `--version`)
- **commonCommands** (array, optional): Frequently used commands

## Tool Categories & Count

1. **devops** (17 tools): Docker, Kubernetes, Terraform, Ansible, Jenkins, etc.
2. **cloud** (5 tools): AWS CLI, Azure CLI, Google Cloud SDK
3. **security** (8 tools): Nmap, Nessus, OpenVAS, Metasploit, etc.
4. **data** (7 tools): PostgreSQL, MySQL, MongoDB, Redis, etc.
5. **system** (12 tools): systemctl, service, top, ps, etc.
6. **code** (6 tools): npm, pip, maven, gradle, make, etc.
7. **networking** (2 tools): curl, wget
8. **monitoring** (1 tool): prometheus

**Total:** 58 tools

## Key Tools by Category

### DevOps
- docker, docker-compose, podman
- kubectl, helm, k9s
- terraform, ansible, puppet
- git, svn
- jenkins

### Cloud
- aws (AWS CLI)
- az (Azure CLI)
- gcloud (Google Cloud SDK)

### Security
- nmap, nessus, openvas
- metasploit
- burp, zap
- snort

### Data
- psql (PostgreSQL)
- mysql
- mongosh (MongoDB)
- redis-cli
- airflow, dbt

### System
- systemctl, service
- top, htop
- ps, kill
- grep, awk, sed
- jq

### Code
- npm, yarn, pnpm
- pip, poetry
- maven, gradle
- dotnet, msbuild
- pytest, jest

## Tool Loading & Detection

### In AgentBase

```javascript
async loadToolRegistry() {
  const registryPath = path.join(__dirname, '..', 'tools', 'registry.json');
  const registry = JSON.parse(await fs.readFile(registryPath, 'utf8'));

  // Filter tools for this agent
  const relevantTools = registry.tools.filter(tool =>
    tool.agents.includes(this.type) || tool.agents.includes('*')
  );

  relevantTools.forEach(tool => {
    this.tools.set(tool.name, tool);
  });
}

async detectAvailableTools() {
  for (const [name, tool] of this.tools) {
    tool.available = await this.executor.isToolAvailable(tool.command || name);

    if (tool.available && tool.versionCommand) {
      tool.version = await this.executor.getToolVersion(name, tool.versionCommand);
    }
  }
}
```

### Tool Availability Check

```javascript
// In tool-executor.js:
async isToolAvailable(toolName) {
  const command = this.platform.isWindows()
    ? `where ${toolName}`
    : `which ${toolName}`;

  const result = await this.execute(command);
  return result.success;
}
```

## Adding New Tools

### Step 1: Add to registry.json

```json
{
  "name": "my-tool",
  "command": "my-tool",
  "description": "My custom tool for doing X",
  "category": "custom",
  "platforms": ["linux", "macos"],
  "agents": ["devops", "system"],
  "versionCommand": "--version",
  "commonCommands": [
    "my-tool init",
    "my-tool run"
  ]
}
```

### Step 2: Update Agent Prompt (Optional)

Add usage examples to relevant prompt files in `prompts/`:

```markdown
#### My Tool
- **Initialize:** `my-tool init`
- **Run:** `my-tool run --config config.yaml`
- **Status:** `my-tool status`
```

### Step 3: Test

```bash
node cli.js devops "Use my-tool to do X"
```

The agent will auto-detect if the tool is installed and available.

## Platform-Specific Notes

### Windows Tools

Use platform filter: `"platforms": ["windows"]`

Examples:
- powershell
- cmd
- msbuild
- dotnet

### macOS Tools

Use platform filter: `"platforms": ["macos"]`

Examples:
- launchctl
- diskutil
- security (keychain)

### Linux-Specific Tools

Use platform filter: `"platforms": ["linux"]`

Examples:
- systemctl
- apt, yum, dnf
- iptables

### Cross-Platform Tools

Use: `"platforms": ["windows", "macos", "linux"]`

Examples:
- git
- docker
- npm
- python

## Agent Assignment

### Global Tools (`"agents": ["*"]`)

Available to all agents:
- git
- curl
- wget

### Specialized Tools

**DevOps agents only:**
- terraform
- ansible
- kubernetes

**Security agents only:**
- nmap
- metasploit
- burp

**Data agents only:**
- psql
- mongodb
- airflow

**Multiple agents:**
```json
"agents": ["devops", "cloud", "system"]
```

## Tool Validation

Tools are validated at runtime:
1. Checked for availability (`which`/`where`)
2. Version detected if `versionCommand` provided
3. Marked as `available: true/false`
4. Only available tools sent to Claude API

## AI Assistant Guidelines

When working with tools:

✅ **DO:**
- Add new tools to registry.json
- Specify accurate platform support
- Include version command when available
- List common commands for reference
- Assign to appropriate agents
- Test tool availability

❌ **DON'T:**
- Add tools that don't exist
- Mark tools for wrong platforms
- Forget to specify agents
- Skip the description
- Add duplicate tools

---

**Last Updated:** 2025-11-19
**Total Tools:** 58
**Next Steps:** Add more platform-specific tools, create platform/ subdirectory organization
