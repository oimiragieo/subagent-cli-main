# 🧠 AI Model Review Instructions (`claude.md`)

This document explains how to install, configure, and use multiple AI model CLIs, including **Google Gemini**, **Anthropic Claude**, **OpenAI Codex**, **Cursor Agent**, **GitHub Copilot**, and **Factory AI Droid**, for reviewing, coding, designing, or planning tasks.

It also includes research-based recommendations for **which model or agent to use** depending on your task (code, UI, planning, automation, etc.).

---

## 📄 One-Page Executive Summary

**If you only read one section, read this.**

### Quick Tool Selection by Task

| Task | Best Tool | Why |
|------|-----------|-----|
| **Code review** | Gemini or Droid | Gemini for large repos; Droid for CI/CD-safe reviews |
| **UI generation** | Codex or Copilot (gpt-5-codex) | Best at turning prompts into front-end components |
| **Multi-file reasoning** | Claude Opus or Gemini | Opus for depth; Gemini for massive context |
| **Large repos (1M+ tokens)** | Gemini | Only tool with 1M token context window |
| **CI/CD safe tasks** | Droid | Read-only by default, fail-fast, deterministic |
| **Automated workflows** | Cursor or Droid | Cursor for chained tasks; Droid for production |
| **Daily coding** | Claude Sonnet | Balanced performance and reasoning |
| **Deep architecture** | Claude Opus | Strongest reasoning capabilities |
| **GitHub PRs/issues** | Copilot | Native GitHub integration |

### Quick Tool Selection by Role

| Role | Best Tools | Primary Use Case |
|------|------------|------------------|
| **Backend Engineer** | Claude Sonnet, Gemini | Code review, API design, refactoring |
| **Frontend Engineer** | Codex, Copilot | UI components, prototyping, design systems |
| **SRE/DevOps** | Droid, Claude, Gemini | CI/CD automation, incident response, security audits |
| **AI/ML Engineer** | Claude Opus, Gemini | Research, architecture, complex reasoning |
| **PM/Designer** | Codex, Copilot | Rapid prototyping, UI mockups, user flows |
| **Data Engineer** | Gemini, Claude Sonnet | Large-scale analysis, ETL pipelines |
| **Security Engineer** | Claude, Droid | Security audits, compliance checks, vulnerability analysis |

### Cost & Speed Quick Reference

| Tool | Cost Tier | Speed | Best Value For |
|------|-----------|-------|---------------|
| **Claude Haiku** | 💰 Low | ⚡ Fast | Quick tasks, budget-conscious |
| **Gemini Flash** | 💰 Low-Medium | ⚡ Fast | Large context, quick analysis |
| **Claude Sonnet** | 💰💰 Medium | ⚡⚡ Medium | Daily coding, balanced |
| **Gemini Pro** | 💰💰 Medium-High | ⚡⚡ Medium | Massive repos |
| **Claude Opus** | 💰💰💰 High | ⚡ Slow | Deep reasoning, architecture |
| **Codex** | 💰💰 Medium | ⚡⚡⚡ Fast | UI generation, prototyping |

### Risk Levels at a Glance

- 🟢 **Low:** Droid (read-only default)
- 🟢 **Low:** Claude (tool approval required)
- 🟠 **Medium:** Gemini, Codex (sandbox modes)
- ⚠️ **High:** Cursor (requires `--force` for writes)
- ⚡ **High:** Copilot (can run shell/git)

### Installation Quick Start

```bash
# Gemini
npm install -g @google/gemini-cli

# Claude
npm install -g @anthropic-ai/claude-code

# Codex
npm install -g @openai/codex

# Cursor
curl https://cursor.com/install -fsS | bash

# Copilot
npm install -g @github/copilot

# Droid
curl -fsSL https://app.factory.ai/cli | sh
```

**Next:** See [Common CLI Concepts](#-common-cli-concepts) for shared patterns, or jump to specific tool sections below.

📄 **Tip: For a condensed printable version, read only:**
- Executive Summary
- Decision Tree
- Model Selection Cheat Sheet
- Role-Based Quick Guide
- Troubleshooting Guide

**Icon Legend:**
- 🚨 = Dangerous (requires caution)
- 🛟 = Safe-by-default (read-only)
- ⚙️ = Required configuration
- ⭐ = Proven approach

---

## 🎯 Quick Decision Tree: Choosing the Right Tool

**10-second decision guide:**

```text
Need huge context (1M+ tokens)?           → Gemini
Need deepest reasoning?                    → Claude Opus
Need UI or front-end generation?          → Codex
Need workflow automation?                  → Cursor
Need CI/CD-safe deterministic runs?        → Droid
Need GitHub integration?                   → Copilot
Need balanced daily coding?                → Claude Sonnet
```

**Detailed flow:**

1. **Context size matters?**
   - **Yes, massive repos** → `Gemini` (up to ~1M tokens)
   - **No** → Continue

2. **Reasoning depth critical?**
   - **Yes, complex architecture** → `Claude Opus`
   - **No** → Continue

3. **UI/front-end generation?**
   - **Yes** → `Codex` or `Copilot (gpt-5-codex)`
   - **No** → Continue

4. **Workflow automation?**
   - **Yes, chained tasks** → `Cursor Agent`
   - **No** → Continue

5. **CI/CD pipeline?**
   - **Yes, production-safe** → `Droid Exec` (read-only by default)
   - **Yes, flexible** → `Gemini CLI` (headless) or `Cursor`
   - **No** → Continue

6. **GitHub integration needed?**
   - **Yes, PRs/issues** → `Copilot CLI`
   - **No** → Continue

7. **Default choice:** `Claude Sonnet` (balanced performance)

---

## 📊 Performance at a Glance

| Tool | Speed | Reasoning | Context | Safety | Best For |
|------|-------|------------|---------|--------|----------|
| **Gemini** | ★★★ | ★★ | ★★★★★ | ★★★ | Huge repos, massive context |
| **Claude Opus** | ★★ | ★★★★★ | ★★ | ★★★★ | Deep reasoning, architecture |
| **Claude Sonnet** | ★★★ | ★★★★ | ★★ | ★★★★ | Daily coding, balanced |
| **Codex** | ★★★★ | ★★★ | ★★ | ★★ | UI/automation, prototyping |
| **Cursor** | ★★★ | ★★★ | ★★ | ★★ | Workflows, chained tasks |
| **Droid** | ★★ | ★★ | ★★ | ★★★★★ | CI/CD, production-safe |
| **Copilot** | ★★★ | ★★★ | ★★ | ★ | GitHub integration, PRs |

**Legend:**
- ★★★★★ = Excellent
- ★★★★ = Very Good
- ★★★ = Good
- ★★ = Fair
- ★ = Basic

---

## 📊 Feature Comparison Table

### Output Formats & Capabilities

| Tool | JSON | Stream JSON | Delta Streaming | File Edits | CI/CD Safe | Notes |
|------|------|-------------|-----------------|------------|------------|-------|
| **Gemini** | ✔ | ✔ | ❌ | ✔ | ✔ | Strong for repo-wide reviews, massive context |
| **Claude** | ✔ | ✔ | ❌ | ✔ | ⚠️ | Strongest reasoning, tool approval required |
| **Codex** | ✔ | ✔ | ✔ | ✔ | ⚠️ | Structured output schemas, sandbox modes |
| **Cursor** | ✔ | ✔ | ✔ | ✔ (--force) | ⚠️ | Strong for chained workflows, incremental updates |
| **Droid** | ✔ | ✔ (debug) | ❌ | via auto levels | ✔ | Safest for CI, read-only by default |
| **Copilot** | ⚠️ | ⚠️ | ❌ | ✔ | ⚠️ | GitHub integration, tool approval system |

**Legend:**
- ✔ = Fully supported
- ⚠️ = Supported with conditions/approvals
- ❌ = Not supported

### Risk Levels & Security Posture

| Tool | Risk Level | Default Behavior | Security Features |
|------|------------|-------------------|------------------|
| **Copilot** | ⚡ **Very High** | Can run shell/git commands | Trusted directories, tool approval |
| **Cursor** | ⚠️ **High** | Proposes changes only | `--force` required for file writes |
| **Codex** | 🟠 **Medium** | Read-only sandbox default | Sandbox modes (workspace-write, danger-full-access) |
| **Claude** | 🟢 **Low** | Tool approval required | Fine-grained tool control, session management |
| **Droid** | 🟢 **Very Low** | Read-only by default | Autonomy levels (low/medium/high), fail-fast |

**Risk mitigation strategies:**
- Use in restricted environments (VM, container, dedicated system)
- Review suggested commands before approval
- Don't launch from home directory or untrusted locations
- Use narrowest permissions that still allow task completion

---

## 🚀 Start Here: Minimal Examples

**Quick start examples for each tool:**

### Gemini
```bash
gemini -p "Summarize this repo"
```

### Claude
```bash
claude -p "Explain this code"
```

### Codex
```bash
codex exec "generate a unit test"
```

### Cursor
```bash
cursor-agent -p "what does this file do?"
```

### Droid
```bash
droid exec "analyze this folder"
```

### Copilot
```bash
copilot -p "Review this code for bugs"
```

**Next steps:** See detailed sections below for advanced usage, output formats, and automation patterns.

---

## 📖 Glossary

**headless mode**: Non-interactive execution mode designed for automation, scripting, and CI/CD pipelines. Commands run without user interaction and output results to stdout/stderr. (Also called "non-interactive mode" or "programmatic mode" in some tools.)

**stream-json**: Real-time JSON output format where each significant event (messages, tool calls, results) is emitted as a separate JSON object, typically newline-delimited (JSONL).

**delta streaming**: Incremental text updates where content is streamed in small chunks (batched deltas), providing smooth real-time progress updates. May appear token-by-token but typically arrives in small batches (e.g., Cursor's `--stream-partial-output`).

**autonomy levels**: Risk-based permission tiers (used by Droid) that control what operations an agent can perform: read-only (default), low, medium, or high risk operations.

**MCP server**: Model Context Protocol server that extends AI agents with additional tools and capabilities. MCP servers provide structured access to external systems (e.g., GitHub, Slack, databases).

**sandbox mode**: Isolated execution environment that restricts file system access, network calls, and system modifications. Different tools offer varying sandbox strictness levels.

**tool approval**: Security mechanism where the CLI requests user permission before executing potentially dangerous operations (file writes, shell commands, etc.).

**trusted directories**: Pre-approved directories where a CLI can operate without additional confirmation prompts. Helps prevent accidental execution in untrusted locations.

**structured output**: JSON-formatted responses that include metadata, statistics, and structured data, making it easier to parse programmatically in automation scripts.

**fail-fast**: Behavior where execution stops immediately with a clear error message if an action exceeds the current permission level, preventing partial changes.

---

## 📑 Navigation

**Quick Links:**
- [📄 Executive Summary](#-one-page-executive-summary)
- [👥 Role-Based Quick Guide](#-role-based-quick-guide)
- [🔧 Common CLI Concepts](#-common-cli-concepts) ⭐ **Read this first**
- [🚀 Google Gemini](#-google-gemini)
- [🧩 Anthropic Claude](#-anthropic-claude-claude-code)
- [🧠 OpenAI Codex](#-openai-codex)
- [💻 Cursor Agent](#-cursor-agent)
- [🤖 GitHub Copilot](#-github-copilot-cli)
- [🤖 Factory AI Droid](#-factory-ai-droid)
- [🎯 Model Selection Cheat Sheet](#-model-selection-cheat-sheet)
- [🧮 Model Recommendations](#-model--agent-recommendations-by-task)
- [🧪 Example Workflows](#-example-workflows)
- [📌 Version Pinning Guide](#-version-pinning-guide)
- [🔍 Troubleshooting Guide](#-troubleshooting-guide)
- [📐 Architecture Overview](#-architecture-overview)
- [⚠️ Limitations & Gotchas](#-limitations--gotchas)

---

## 👥 Role-Based Quick Guide

**Choose tools based on your role and primary tasks:**

### Backend Engineer
**Best Tools:** Claude Sonnet, Gemini
**Primary Tasks:**
- Code review and refactoring → `claude -p "Review this API endpoint"`
- Multi-file architecture → `gemini -p "Analyze the authentication system"`
- API design → `claude -p "Design a REST API for user management"`

### Frontend Engineer
**Best Tools:** Codex, Copilot
**Primary Tasks:**
- UI components → `codex exec "Create a React button component"`
- Design systems → `copilot -p "Generate a Tailwind component library"`
- Prototyping → `codex exec "Build a login form with validation"`

### SRE/DevOps
**Best Tools:** Droid, Claude, Gemini
**Primary Tasks:**
- CI/CD automation → `droid exec "Run security audit and generate report"`
- Incident response → `claude -p "Diagnose production API errors"`
- Infrastructure as code → `gemini -p "Review Terraform configs for best practices"`

### AI/ML Engineer
**Best Tools:** Claude Opus, Gemini
**Primary Tasks:**
- Research and architecture → `claude -p "Design a transformer architecture"`
- Large-scale analysis → `gemini -p "Analyze this ML pipeline across 500 files"`
- Model evaluation → `claude -p "Review model performance metrics"`

### PM/Designer
**Best Tools:** Codex, Copilot
**Primary Tasks:**
- Rapid prototyping → `codex exec "Create a user onboarding flow"`
- UI mockups → `copilot -p "Generate a dashboard design"`
- User flows → `codex exec "Map the checkout process"`

### Data Engineer
**Best Tools:** Gemini, Claude Sonnet
**Primary Tasks:**
- ETL pipelines → `gemini -p "Review this data transformation pipeline"`
- Large-scale analysis → `gemini -p "Analyze data quality across datasets"`
- Schema design → `claude -p "Design a data warehouse schema"`

### Security Engineer
**Best Tools:** Claude, Droid
**Primary Tasks:**
- Security audits → `droid exec "Audit codebase for SQL injection risks"`
- Compliance checks → `claude -p "Review code for GDPR compliance"`
- Vulnerability analysis → `droid exec "Scan for known CVEs in dependencies"`

---

## 🔧 Common CLI Concepts

**This section consolidates patterns shared across all tools. Individual tool sections reference this instead of repeating details.**

### Headless Mode (Non-Interactive Execution)

All tools support headless mode for automation, scripting, and CI/CD pipelines. Commands run without user interaction and output to stdout/stderr.

**Common patterns:**
```bash
# Direct prompt
tool -p "Your prompt here"

# Stdin input
echo "Your prompt" | tool

# File input
cat prompt.txt | tool -p

# Combine with pipes
git diff | tool -p "Review these changes"
```

**Exit codes:**
- `0` = Success
- Non-zero = Error (check tool-specific documentation)

### JSON Output Format

All tools support JSON output for programmatic processing. Use `--output-format json` or `--json` flag.

**Common structure:**
```json
{
  "result": "Response text",
  "metadata": {
    "cost": 0.003,
    "duration_ms": 1234,
    "tokens": 500
  }
}
```

**Parsing with jq:**
```bash
tool -p "query" --output-format json | jq -r '.result'
```

### Streaming JSON Output

Most tools support real-time JSON streaming (JSONL format) for monitoring progress.

**Common usage:**
```bash
tool -p "query" --output-format stream-json | while IFS= read -r line; do
  event=$(echo "$line" | jq -r '.type')
  echo "Event: $event"
done
```

**Event types (tool-specific):**
- `system.init`: Session initialization
- `assistant`: Assistant messages
- `tool_call.*`: Tool execution events
- `result`: Final outcome with stats

### File Modifications & Risk Levels

**Default behaviors:**
- **Read-only:** Droid (default), Codex (default sandbox), Cursor (without `--force`)
- **Requires approval:** Claude, Copilot (tool approval system)
- **Can modify:** Gemini, Codex (with sandbox modes), Cursor (with `--force`), Droid (with `--auto`)

**Risk mitigation:**
- Use in restricted environments (VM, container)
- Review suggested commands before approval
- Don't launch from home directory
- Use narrowest permissions that allow task completion

### Tool Approval & Permissions

**Claude & Copilot:**
- First-time tool use requires approval
- Options: Yes (this time), Yes (rest of session), No
- Pre-approve with `--allowedTools` or `--allow-tool`

**Droid:**
- Autonomy levels: `--auto low`, `--auto medium`, `--auto high`
- Fail-fast if action exceeds autonomy level
- Factory-side restrictions prevent destructive commands even at high autonomy

**Codex:**
- Sandbox modes: `--full-auto` (workspace-write), `--sandbox danger-full-access`
- Default is read-only

### Session Management

**Resume conversations:**
```bash
# Continue most recent (Claude, Codex)
tool --continue "Next step"

# Resume by session ID
tool --resume <session-id> "Continue"
```

**Session storage:**
- Session IDs typically stored in tool config directories
- Use `--session-id` or `--resume` flags

### Model Selection

**Change models:**
```bash
# Gemini
gemini -p "query" --model gemini-2.5-pro

# Claude
claude -p "query" --model claude-opus-4-1

# Codex
codex exec "query" --model gpt-5-codex

# Droid
droid exec "query" -m claude-sonnet-4-20250514
```

**Default models:**
- Gemini: `gemini-2.5-pro` (or latest)
- Claude: `claude-sonnet-4.5` (or latest)
- Codex: `gpt-5-codex` (automatically aliases to `gpt-5-codex-latest`, the most recent stable Codex model)
- Copilot: GitHub typically uses Claude Sonnet 4 (or newer Sonnet 4.x series), but may switch to GPT-4.1 or other models depending on task, region, or org settings
- Droid: `gpt-5-codex` (configurable)

### CI/CD Integration

**Proven approaches:**
- ⭐ Use structured output (JSON) for parsing
- ⭐ Check exit codes for error handling
- ⭐ Set appropriate autonomy/permission levels
- ⭐ Use read-only modes when possible
- ⭐ Use retry logic with exponential backoff

**Example pattern:**
```bash
#!/bin/bash
set -e

result=$(tool -p "query" --output-format json)
if [ $? -ne 0 ]; then
  echo "Error: Tool execution failed"
  exit 1
fi

# Parse and use result
response=$(echo "$result" | jq -r '.result')
echo "$response"
```

---

## 🚀 Google Gemini

**Version tested:** Latest (check with `gemini --version`)
**Risk level:** 🟠 Medium (can modify files, requires approval for some operations)

**Note:** Gemini 2.5 Flash/Pro typically support ~1M-token context in the CLI, though actual limits may vary slightly by API version or account tier. Some developer preview users may have access to up to ~2M tokens.

**When NOT to use Gemini:**
- ❌ You need extremely low cost (Gemini uses premium pricing for large contexts)
- ❌ You need ultra-low-latency (slower than smaller models for short prompts)
- ❌ You need GPT-style code generation (better for analysis than generation)
- ❌ You're working with small codebases (overkill for simple tasks)

### Quick Nav
- [Start Here](#-start-here-1)
- [Why Use Gemini](#-why-use-gemini)
- [Best Use Cases](#-best-use-cases)
- [Output Formats](#-output-formats)
- [Configuration Options](#-configuration-options)
- [Example Workflows](#-example-workflows-1)

**Install CLI:**
```bash
npm install -g @google/gemini-cli
```

**🚀 Start here:**
```bash
gemini -p "Summarize this repo"
```

**Run a prompt (Headless Mode):**
```bash
# Direct prompt
gemini --prompt "Your prompt here"
# or shorthand
gemini -p "Your prompt here"

# Stdin input
echo "Explain this code" | gemini

# Combine with file input
cat README.md | gemini -p "Summarize this documentation"
```

### ✅ Why use Gemini
- Built for **massive context windows** (up to ~1 million tokens; see note above about variations).
- Strong for **large-scale codebases**, multi-file reviews, and deep context reasoning.
- **Headless mode** designed for automation, scripting, and CI/CD pipelines.
- Integrates with terminal and supports file operations, shell commands, and web actions.
- **Structured output** formats (text, JSON, streaming JSON) for programmatic processing.

### 💡 Best Use Cases
- Refactoring or reviewing entire repositories.
- Automated PR/code reviews (`gemini review`).
- Complex technical analysis or documentation generation.
- **CI/CD automation**: headless mode for pipelines and scripts
- **Batch processing**: analyze multiple files programmatically
- **Log analysis**: process and analyze application logs

### ⚙️ Output Formats

**Text (default):**
```bash
gemini -p "What is the capital of France?"
```

**JSON (for automation):**
```bash
gemini -p "What is the capital of France?" --output-format json
```

Returns structured data with response, statistics, and metadata:
```json
{
  "response": "The capital of France is Paris.",
  "stats": {
    "models": {
      "gemini-2.5-pro": {
        "api": { "totalRequests": 2, "totalErrors": 0 },
        "tokens": { "prompt": 24939, "candidates": 20, "total": 25113 }
      }
    },
    "tools": {
      "totalCalls": 1,
      "totalSuccess": 1
    },
    "files": {
      "totalLinesAdded": 0,
      "totalLinesRemoved": 0
    }
  }
}
```

**Streaming JSON (real-time events):**
```bash
gemini --output-format stream-json --prompt "Analyze this code"
```

Emits real-time events (init, message, tool_use, tool_result, error, result) as newline-delimited JSON. Ideal for monitoring long-running operations and building event-driven automation.

### ⚙️ Configuration Options

**Model selection:**
```bash
gemini -p "query" --model gemini-2.5-flash
```

**Auto-approve actions:**
```bash
gemini -p "query" --yolo
```

**Include additional directories:**
```bash
gemini -p "query" --include-directories src,docs
```

**Debug mode:**
```bash
gemini -p "query" --debug
```

**File redirection:**
```bash
# Save to file
gemini -p "Explain Docker" > docker-explanation.txt
gemini -p "Explain Docker" --output-format json > docker-explanation.json

# Pipe to other tools
gemini -p "What is Kubernetes?" --output-format json | jq '.response'
```

### ⚙️ Example Workflows

**Code review:**
```bash
cat src/auth.py | gemini -p "Review this authentication code for security issues" > security-review.txt
```

**Generate commit messages:**
```bash
result=$(git diff --cached | gemini -p "Write a concise commit message for these changes" --output-format json)
echo "$result" | jq -r '.response'
```

**Batch code analysis:**
```bash
for file in src/*.py; do
    result=$(cat "$file" | gemini -p "Find potential bugs and suggest improvements" --output-format json)
    echo "$result" | jq -r '.response' > "reports/$(basename "$file").analysis"
done
```

**Log analysis:**
```bash
grep "ERROR" /var/log/app.log | tail -20 | gemini -p "Analyze these errors and suggest root cause and fixes" > error-analysis.txt
```

**Release notes generation:**
```bash
result=$(git log --oneline v1.0.0..HEAD | gemini -p "Generate release notes from these commits" --output-format json)
echo "$result" | jq -r '.response' >> CHANGELOG.md
```

### ⚠️ Notes
- Slower than smaller models for short prompts.
- Higher token costs.
- Headless mode provides consistent exit codes for error handling in automation.
- JSON output includes detailed statistics (tokens, tool calls, file modifications).

---

## 🧩 Anthropic Claude (Claude Code)

**Version tested:** Latest (check with `claude --version`)
**Risk level:** 🟢 Low (tool approval required, fine-grained control)

**When NOT to use Claude:**
- ❌ You need massive context windows (Gemini handles larger repos better)
- ❌ You need UI/front-end generation (Codex is better for this)
- ❌ You need completely automated runs without any approval (Droid is safer)
- ❌ You're working with large monorepos (context limits may be restrictive)

### Quick Nav
- [Start Here](#-start-here-2)
- [Why Use Claude](#-why-use-claude)
- [Best Use Cases](#-best-use-cases-1)
- [Output Formats](#-output-formats-1)
- [Configuration Options](#-configuration-options-1)
- [Example Workflows](#-example-workflows-2)

**Install CLI:**
```bash
npm install -g @anthropic-ai/claude-code
```

**🚀 Start here:**
```bash
claude -p "Explain this code"
```

**Run a prompt (Headless Mode):**
```bash
# Direct prompt (non-interactive)
claude --print "Your prompt here"
# or shorthand
claude -p "Your prompt here"

# From stdin
echo "Explain this code" | claude -p

# With tool permissions
claude -p "Stage my changes and write a set of commits for them" \
  --allowedTools "Bash,Read" \
  --permission-mode acceptEdits
```

### ✅ Why use Claude
- Tuned for **agentic coding**, architecture, and reasoning.
- **Headless mode** designed for automation, scripting, and CI/CD pipelines.
- Multiple model options for performance vs. cost balance:
  - **Haiku**: Fast, cost-effective
  - **Sonnet**: Balanced, ideal for daily use
  - **Opus**: Deep reasoning and complex code refactoring
- **Tool control**: fine-grained control over allowed/disallowed tools
- **Session management**: resume conversations and maintain context

### 💡 Best Use Cases
- Writing and documenting code.
- Reviewing architecture and planning features.
- Multi-step debugging or logic-heavy tasks.
- **CI/CD automation**: headless mode for pipelines and scripts
- **Security reviews**: automated security audits and compliance checks
- **SRE operations**: incident response and system diagnostics

### ⚙️ Output Formats

**Text (default):**
```bash
claude -p "Explain file src/components/Header.tsx"
```

**JSON (for automation):**
```bash
claude -p "How does the data layer work?" --output-format json
```

Returns structured data with metadata:
```json
{
  "type": "result",
  "subtype": "success",
  "total_cost_usd": 0.003,
  "is_error": false,
  "duration_ms": 1234,
  "duration_api_ms": 800,
  "num_turns": 6,
  "result": "The response text here...",
  "session_id": "abc123"
}
```

**Streaming JSON (real-time events):**
```bash
claude -p "Build an application" --output-format stream-json
```

Streams each message as it is received, beginning with an `init` system message, followed by user and assistant messages, and ending with a `result` system message with stats.

### ⚙️ Configuration Options

**Tool control:**
```bash
# Allow specific tools
claude -p "query" --allowedTools "Bash,Read,WebSearch,mcp__filesystem"

# Disallow specific tools
claude -p "query" --disallowedTools "Bash(git commit),mcp__github"

# Permission mode
claude -p "query" --permission-mode acceptEdits
```

**Session management:**
```bash
# Continue most recent conversation
claude --continue "Now refactor this for better performance"

# Resume specific conversation by session ID
claude --resume abc123 "Update the tests"

# Resume in non-interactive mode
claude --resume abc123 "Fix all linting issues" --no-interactive
```

**MCP configuration:**
```bash
# Load MCP servers from JSON file
claude -p "query" --mcp-config servers.json
```

**System prompt customization:**
```bash
claude -p "query" --append-system-prompt "You are an SRE expert. Diagnose issues and provide action items."
```

**Verbose logging:**
```bash
claude -p "query" --verbose
```

### ⚙️ Input Formats

**Text input (default):**
```bash
# Direct argument
claude -p "Explain this code"

# From stdin
echo "Explain this code" | claude -p
```

**Streaming JSON input:**
```bash
# Multi-turn conversation via stdin (requires stream-json output)
echo '{"type":"user","message":{"role":"user","content":[{"type":"text","text":"Explain this code"}]}}' | \
  claude -p --output-format=stream-json --input-format=stream-json --verbose
```

### ⚙️ Example Workflows

**SRE Incident Response:**
```bash
#!/bin/bash
investigate_incident() {
    local incident_description="$1"
    local severity="${2:-medium}"

    claude -p "Incident: $incident_description (Severity: $severity)" \
      --append-system-prompt "You are an SRE expert. Diagnose the issue, assess impact, and provide immediate action items." \
      --output-format json \
      --allowedTools "Bash,Read,WebSearch,mcp__datadog" \
      --mcp-config monitoring-tools.json
}

investigate_incident "Payment API returning 500 errors" "high"
```

**Automated Security Review:**
```bash
# Security audit for pull requests
audit_pr() {
    local pr_number="$1"
    gh pr diff "$pr_number" | claude -p \
      --append-system-prompt "You are a security engineer. Review this PR for vulnerabilities, insecure patterns, and compliance issues." \
      --output-format json \
      --allowedTools "Read,Grep,WebSearch"
}

audit_pr 123 > security-report.json
```

**Multi-turn Legal Assistant:**
```bash
# Legal document review with session persistence
session_id=$(claude -p "Start legal review session" --output-format json | jq -r '.session_id')

# Review contract in multiple steps
claude -p --resume "$session_id" "Review contract.pdf for liability clauses"
claude -p --resume "$session_id" "Check compliance with GDPR requirements"
claude -p --resume "$session_id" "Generate executive summary of risks"
```

**Parse JSON response:**
```bash
result=$(claude -p "Generate code" --output-format json)
code=$(echo "$result" | jq -r '.result')
cost=$(echo "$result" | jq -r '.total_cost_usd')
```

### ⚠️ Notes
- Context limit smaller than Gemini, but better for reasoning.
- Opus model may be slower/costlier.
- Use JSON output format for programmatic parsing.
- Handle errors gracefully; check exit codes and stderr
- Consider timeouts for long-running operations.
- Respect rate limits when making multiple requests.

---

## 🧠 OpenAI Codex

**Version tested:** Latest (check with `codex --version`)
**Risk level:** 🟠 Medium (sandbox modes differ, read-only default)

**Note:** This is the 2025 OpenAI Codex CLI tool, not the original 2021 Codex model. The CLI provides programmatic access to OpenAI's latest code generation models (GPT-5 Codex, etc.).

**When NOT to use Codex:**
- ❌ You need deep reasoning for complex architecture (Claude Opus is better)
- ❌ You need massive context windows (Gemini handles larger repos)
- ❌ You're not in a Git repository (requires Git repo by default, unless you override)
- ❌ You need deterministic, production-safe CI/CD runs (Droid is safer)

**Git repository requirement:** The Codex CLI assumes the workspace is a Git repository because many of its built-in capabilities rely on diff analysis and file tracking. Use `--skip-git-repo-check` to override this requirement.

### Quick Nav
- [Start Here](#-start-here-3)
- [Why Use Codex](#-why-use-codex)
- [Best Use Cases](#-best-use-cases-2)
- [Permission Modes](#-permission-modes)
- [Output Control](#-output-control)
- [Example Workflows](#-example-workflows-3)

**Install CLI:**
```bash
npm install -g @openai/codex
```

**🚀 Start here:**
```bash
codex exec "generate a unit test"
```

**Run a prompt (Non-interactive execution):**
```bash
# Basic execution (read-only by default)
codex exec "Your prompt here"

# Allow file edits
codex exec --full-auto "Your prompt here"

# Allow edits and networked commands
codex exec --sandbox danger-full-access "Your prompt here"

# Pipe output to file
codex exec "generate release notes" | tee release-notes.md
```

### ✅ Why use Codex
- Strong for **UI generation**, **prototyping**, and **planning** tasks.
- **Non-interactive execution** designed for CI/CD pipelines and automation.
- Converts natural language into working code.
- Turns product ideas into quick front-end scaffolds.
- **Programmatic control** via TypeScript SDK, CLI, or GitHub Actions.
- **Structured output** with JSON Schema support for automation.

### 💡 Best Use Cases
- Generating UI components and design systems.
- Planning workflows or writing quick automation scripts.
- Integrating LLMs into apps or CLIs.
- **CI/CD automation**: automated code reviews, patches, and quality checks
- **GitHub Actions**: PR reviews, release prep, and migrations
- **Structured data extraction**: JSON Schema-based output for pipelines

### ⚙️ Permission Modes

**Default (read-only):**
```bash
codex exec "find any remaining TODOs and create plans"
```
- Read-only sandbox
- No file modifications
- No networked commands

**Allow file edits:**
```bash
codex exec --full-auto "Refactor authentication module"
```

**Allow edits and network:**
```bash
codex exec --sandbox danger-full-access "Install dependencies and update config"
```

### ⚙️ Output Control

**Default (final message to stdout):**
```bash
codex exec "generate release notes" | tee release-notes.md
```
- Streams activity to stderr
- Final agent message to stdout
- Easy to pipe into other tools

**Save to file:**
```bash
codex exec -o output.md "analyze codebase"
# or
codex exec --output-last-message output.md "analyze codebase"
```

**JSON streaming (all events):**
```bash
codex exec --json "summarize the repo structure" | jq
```

Event types include:
- `thread.started`
- `turn.started`, `turn.completed`, `turn.failed`
- `item.*` (agent messages, reasoning, commands, file changes, MCP tool calls, web searches, plan updates)
- `error`

Example JSON stream:
```json
{"type":"thread.started","thread_id":"0199a213-81c0-7800-8aa1-bbab2a035a53"}
{"type":"turn.started"}
{"type":"item.started","item":{"id":"item_1","type":"command_execution","command":"bash -lc ls","status":"in_progress"}}
{"type":"item.completed","item":{"id":"item_3","type":"agent_message","text":"Repo contains docs, sdk, and examples directories."}}
{"type":"turn.completed","usage":{"input_tokens":24763,"cached_input_tokens":24448,"output_tokens":122}}
```

### ⚙️ Structured Output

Use JSON Schema to receive structured JSON output:

**schema.json:**
```json
{
  "type": "object",
  "properties": {
    "project_name": { "type": "string" },
    "programming_languages": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["project_name", "programming_languages"],
  "additionalProperties": false
}
```

**Usage:**
```bash
codex exec "Extract project metadata" \
  --output-schema ./schema.json \
  -o ./project-metadata.json
```

Output conforms to your schema, perfect for feeding into scripts or CI pipelines.

### ⚙️ Session Management

**Resume last session:**
```bash
codex exec "Review the change for race conditions"
codex exec resume --last "Fix the race conditions you found"
```

**Resume specific session:**
```bash
codex exec resume <SESSION_ID> "Continue from where we left off"
```

### ⚙️ TypeScript SDK

**Install SDK:**
```bash
npm install @openai/codex-sdk
```

**Usage:**
```typescript
import { Codex } from "@openai/codex-sdk";

const codex = new Codex();
const thread = codex.startThread();
const result = await thread.run(
  "Make a plan to diagnose and fix the CI failures"
);

// Continue on same thread
const result2 = await thread.run("Execute the plan");

// Resume past thread
const thread2 = codex.resumeThread(threadId);
const result3 = await thread2.run("Pick up where you left off");
```

### ⚙️ GitHub Action

Use `openai/codex-action@v1` for CI/CD integration:

```yaml
name: Codex pull request review
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  codex:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v5
      - name: Run Codex
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          prompt-file: .github/codex/prompts/review.md
          output-file: codex-output.md
          safety-strategy: drop-sudo
          sandbox: workspace-write
```

**Key features:**
- Automated PR reviews and feedback
- CI pipeline quality checks
- Repeatable tasks (code review, release prep, migrations)
- Safety strategies (drop-sudo, unprivileged-user, read-only)

### ⚙️ Authentication

**Default (uses CLI authentication):**
```bash
codex exec "query"
```

**Override for single run:**
```bash
CODEX_API_KEY=your-api-key codex exec --json "triage open bug reports"
```

### ⚙️ Example Workflows

**Automated code review:**
```bash
codex exec --json "Review PR changes for bugs and security issues" | \
  jq -r 'select(.type=="item.completed" and .item.type=="agent_message") | .item.text'
```

**Structured metadata extraction:**
```bash
codex exec "Extract project metadata" \
  --output-schema ./schema.json \
  -o ./project-metadata.json
```

**Multi-step task with session:**
```bash
codex exec "Analyze codebase structure"
codex exec resume --last "Generate migration plan"
codex exec resume --last "Create execution checklist"
```

### ⚠️ Notes
- Not as strong for deep reasoning or multi-step architecture.
- Smaller context window than Gemini.
- Requires Git repository by default (override with `--skip-git-repo-check`).
- Use `--full-auto` or `--sandbox` flags to enable file modifications.
- JSON streaming provides detailed event-level visibility.
- Structured output with JSON Schema ensures consistent data format.

---

## 💻 Cursor Agent

**Version tested:** Latest (check with `cursor-agent --version`)
**Risk level:** ⚠️ High (writes files with `--force`, strong for chained workflows)

### Quick Nav
- [Start Here](#-start-here-4)
- [Why Use Cursor](#-why-use-cursor)
- [Best Use Cases](#-best-use-cases-3)
- [File Modification](#-file-modification)
- [Output Formats](#-output-formats-2)
- [Example Scripts](#-example-scripts)

**When NOT to use Cursor:**
- ❌ You need production-safe CI/CD runs (Droid is safer with read-only default)
- ❌ You need massive context windows (Gemini handles larger repos)
- ❌ You need deterministic, predictable output (delta messages can be verbose)
- ❌ You're working in untrusted environments (requires `--force` for file writes)

**Install CLI:**
```bash
curl https://cursor.com/install -fsS | bash
```

**Set API key:**
```bash
export CURSOR_API_KEY=your_api_key_here
```

**🚀 Start here:**
```bash
cursor-agent -p "what does this file do?"
```

**Run a prompt (Headless Mode):**
```bash
# Basic non-interactive mode (proposes changes, doesn't modify files)
cursor-agent -p "Your prompt here"

# Enable file modifications in scripts
cursor-agent -p --force "Refactor this code to use ES6+ syntax"

# Example (via WSL):
wsl bash -lc "cursor-agent -p 'Your prompt here'"
```

### ✅ Why use Cursor
- Strong for **workflow automation** and **multi-agent orchestration**.
- **Headless mode** designed for automation, scripting, and CI/CD pipelines.
- Can chain tasks such as plan → code → test → deploy.
- Integrates well with VS Code and terminal pipelines.
- **File modification control**: use `--force` to enable actual file changes in scripts
- **Multiple output formats**: text, JSON, and streaming JSON for different automation needs

### 💡 Best Use Cases
- Automating build/test pipelines.
- Generating, testing, and summarizing code automatically.
- Running multi-step agentic workflows.
- **CI/CD automation**: headless mode for pipelines and scripts
- **Automated code reviews**: structured analysis with JSON output
- **Batch processing**: process multiple files with file modifications

### ⚙️ File Modification

**Default (proposes changes only):**
```bash
cursor-agent -p "Add JSDoc comments to this file"
# Won't modify files, only proposes changes
```

**Enable file modifications:**
```bash
cursor-agent -p --force "Refactor this code to use ES6+ syntax"
# Actually modifies files without confirmation
```

**Batch processing with file changes:**
```bash
find src/ -name "*.js" | while read file; do
  cursor-agent -p --force "Add comprehensive JSDoc comments to $file"
done
```

**Warning:** `--force` enables direct file writes with no confirmation.

### ⚙️ Output Formats

**Text (default):**
```bash
cursor-agent -p "What does this codebase do?"
```
- Clean, final-answer-only responses
- Ideal for simple queries and codebase questions

**JSON (structured analysis):**
```bash
cursor-agent -p --force --output-format json \
  "Review the recent code changes and provide feedback"
```
- Structured data for programmatic processing
- Perfect for automated code reviews and analysis

**Streaming JSON (real-time progress):**
```bash
cursor-agent -p --force --output-format stream-json \
  "Analyze this project structure and create a summary report"
```
- Message-level progress tracking
- See tool calls, file operations, and progress in real-time

**Streaming with partial output (incremental deltas):**
```bash
cursor-agent -p --force --output-format stream-json --stream-partial-output \
  "Analyze this project structure and create a summary report"
```
- Model-native incremental streaming (batched deltas) that behaves like token-level updates but may arrive in small chunks instead of single tokens
- Smooth progress updates character-by-character
- Ideal for long-running operations with live feedback

### ⚙️ Example Scripts

**Simple codebase question:**
```bash
#!/bin/bash
cursor-agent -p "What does this codebase do?"
```

**Automated code review:**
```bash
#!/bin/bash
echo "Starting code review..."

cursor-agent -p --force --output-format text \
  "Review the recent code changes and provide feedback on:
  - Code quality and readability
  - Potential bugs or issues
  - Security considerations
  - Proven approaches compliance

  Provide specific suggestions for improvement and write to review.txt"

if [ $? -eq 0 ]; then
  echo "✅ Code review completed successfully"
else
  echo "❌ Code review failed"
  exit 1
fi
```

**Real-time progress tracking:**
```bash
#!/bin/bash
# Track progress in real-time with streaming JSON

cursor-agent -p --force --output-format stream-json --stream-partial-output \
  "Analyze this project structure and create a summary report" | \
  while IFS= read -r line; do
    type=$(echo "$line" | jq -r '.type // empty')
    subtype=$(echo "$line" | jq -r '.subtype // empty')

    case "$type" in
      "system")
        if [ "$subtype" = "init" ]; then
          model=$(echo "$line" | jq -r '.model // "unknown"')
          echo "🤖 Using model: $model"
        fi
        ;;
      "assistant")
        content=$(echo "$line" | jq -r '.message.content[0].text // empty')
        printf "\r📝 Generating: %d chars" ${#content}
        ;;
      "tool_call")
        if [ "$subtype" = "started" ]; then
          if echo "$line" | jq -e '.tool_call.writeToolCall' > /dev/null 2>&1; then
            path=$(echo "$line" | jq -r '.tool_call.writeToolCall.args.path // "unknown"')
            echo -e "\n🔧 Creating $path"
          fi
        fi
        ;;
      "result")
        duration=$(echo "$line" | jq -r '.duration_ms // 0')
        echo -e "\n\n🎯 Completed in ${duration}ms"
        ;;
    esac
  done
```

### ⚙️ Stream Event Types

When using `--output-format stream-json`, events include:

- **`system.init`**: Session initialization with model information
- **`assistant`**: Assistant messages with content deltas
- **`tool_call.started`**: Tool execution begins (readToolCall, writeToolCall, etc.)
- **`tool_call.completed`**: Tool execution completes with results
- **`result`**: Final session outcome with duration and stats

### ⚙️ Authentication

**Set API key:**
```bash
export CURSOR_API_KEY=your_api_key_here
cursor-agent -p "Analyze this code"
```

### ⚠️ Notes
- Best used in combination with Claude or Gemini for reasoning.
- Use `--force` flag to enable file modifications in headless mode.
- Without `--force`, changes are only proposed, not applied.
- Streaming JSON provides detailed event-level visibility for monitoring.
- `--stream-partial-output` enables incremental character-by-character updates.

---

## 🤖 GitHub Copilot (CLI)

**Version tested:** Latest (check with `copilot --version`)
**Risk level:** ⚡ High (can run shell/git, requires careful tool management)

### Quick Nav
- [Start Here](#-start-here-5)
- [Why Use Copilot](#-why-use-copilot)
- [Best Use Cases](#-best-use-cases-4)
- [Programmatic Mode Examples](#-programmatic-mode-examples)
- [Tool Approval Options](#-tool-approval-options)
- [Security Considerations](#-security-considerations)

**When NOT to use Copilot:**
- ❌ You're in an untrusted repository (can execute shell/git commands)
- ❌ You can't risk shell commands being run (high risk level)
- ❌ You need deterministic runs (tool approval can vary)
- ❌ You don't need GitHub integration (other tools are safer)
- ❌ You're working in production CI/CD without careful sandboxing

**Install CLI:**
```bash
npm install -g @github/copilot
```

**🚀 Start here:**
```bash
copilot -p "Review this code for bugs"
```

**Run a prompt (Programmatic Mode):**
```bash
# Basic programmatic mode
copilot -p "Your prompt here"

# With tool approval options
copilot -p "Revert the last commit" --allow-all-tools
```

### ✅ Why use Copilot
- CLI version of GitHub Copilot with **programmatic mode** for automation.
- **Default model**: Claude Sonnet 4 (can be changed with `/model` slash command in interactive mode).
- **Tool control**: fine-grained control over allowed/denied tools for security
- **Trusted directories**: security-first approach with directory trust confirmation
- **GitHub integration**: manage PRs, issues, workflows, and Actions directly from CLI
- **MCP support**: integrates with Model Context Protocol servers

### 💡 Best Use Cases
- Quick code suggestions and refactors.
- **Automated code reviews**: review PRs and provide feedback
- **GitHub management**: create, merge, and manage pull requests
- **GitHub Actions**: create and manage workflows
- **Issue management**: find and manage GitHub issues
- **CI/CD automation**: programmatic mode for pipelines and scripts

### ⚙️ Programmatic Mode Examples

**Code review:**
```bash
copilot -p "Review the changes in this PR and tell me what problems you find"
```

**Manage pull requests:**
```bash
copilot -p "Merge all of the open PRs that I've created in octo-org/octo-repo"
copilot -p "Close PR #11 on octo-org/octo-repo"
```

**Find issues:**
```bash
copilot -p "Use the GitHub MCP server to find good first issues for a new team member to work on from octo-org/octo-repo"
```

**GitHub Actions workflows:**
```bash
copilot -p "List any Actions workflows in this repo that add comments to PRs"

copilot -p "Branch off from main and create a GitHub Actions workflow that will run on pull requests, or can be run manually. The workflow should run eslint to check for problems in the changes made in the PR. If warnings or errors are found these should be shown as messages in the diff view of the PR. I want to prevent code with errors from being merged into main so, if any errors are found, the workflow should cause the PR check to fail. Push the new branch and create a pull request."
```

### ⚙️ Tool Approval Options

**Allow all tools (use with caution):**
```bash
copilot -p "Revert the last commit" --allow-all-tools
```

**Deny specific tools:**
```bash
# Prevent using rm command
copilot --deny-tool 'shell(rm)' -p "Clean up temporary files"

# Prevent git push
copilot --deny-tool 'shell(git push)' -p "Stage and commit changes"
```

**Allow specific tools:**
```bash
# Allow all shell commands
copilot --allow-tool 'shell' -p "Run build script"

# Allow file write operations
copilot --allow-tool 'write' -p "Update configuration files"

# Allow specific MCP server tools
copilot --allow-tool 'My-MCP-Server' -p "Use MCP tools"
```

**Combining options:**
```bash
# Allow all tools except rm and git push
copilot --allow-all-tools --deny-tool 'shell(rm)' --deny-tool 'shell(git push)' \
  -p "Refactor codebase"

# Allow MCP server but deny specific tool
copilot --allow-tool 'My-MCP-Server' --deny-tool 'My-MCP-Server(tool_name)' \
  -p "Use MCP tools"
```

### ⚙️ Security Considerations

**Trusted directories:**
- When starting a session, you'll be asked to confirm trust for the current directory.
- Choose to trust for current session only, or for future sessions.
- Edit permanently trusted directories in `~/.copilot/config.json` (or `$XDG_CONFIG_HOME/copilot/config.json`).

**Tool approval:**
- First time using a tool (e.g., `touch`, `chmod`, `node`, `sed`), Copilot asks for approval.
- Options:
  1. Yes (this time only)
  2. Yes, and approve for rest of session
  3. No, and tell Copilot what to do differently

**Risk mitigation:**
- Use in restricted environments (VM, container, dedicated system).
- Review suggested commands carefully.
- Don't launch from home directory or untrusted locations.
- Scoping is heuristic; GitHub doesn't guarantee all files outside trusted directories are protected.

### ⚙️ Model Usage

**Default model:**
- GitHub typically uses Claude Sonnet 4 (or newer Sonnet 4.x series) as the default
- GitHub may auto-switch to GPT-4.1, GPT-4.1 Mini, or other models depending on:
  - Task type (coding vs. non-coding queries)
  - Region/org configuration
  - Early access settings
- GitHub reserves the right to change the default model

**Change model:**
- Use `/model` slash command in interactive mode to select a different model.
- Each prompt submission uses one premium request from your monthly quota.

### ⚙️ MCP Integration

**Specify MCP servers in prompts:**
```bash
copilot -p "Use the GitHub MCP server to find good first issues"
```

If you know a specific MCP server can achieve a task, specifying it in your prompt helps Copilot deliver better results.

### ⚙️ Configuration

**Config file location:**
- Default: `~/.copilot/config.json`
- Custom: Set `XDG_CONFIG_HOME` environment variable

**Edit trusted directories:**
```json
{
  "trusted_folders": [
    "/path/to/trusted/directory"
  ]
}
```

### ⚠️ PowerShell Syntax
```powershell
# Programmatic mode
copilot -p "Your prompt here"

# With tool approval
copilot -p "Your prompt here" --allow-all-tools
```

### ⚠️ Notes
- Each prompt submission uses one premium request from your monthly quota.
- Always review suggested commands before approval.
- Use `--allow-all-tools` with caution; it bypasses security checks.
- Tool approval options work in both interactive and programmatic mode.
- Trusted directory scoping is heuristic and not guaranteed to protect all files.

---

## 🤖 Factory AI Droid

**Version tested:** Latest (check with `droid --version`)
**Risk level:** 🟢 Low (read-only by default, safest for CI/CD)

### Quick Nav
- [Start Here](#-start-here-6)
- [Why Use Droid](#-why-use-droid)
- [Best Use Cases](#-best-use-cases-5)
- [Autonomy Levels](#-autonomy-levels)
- [Output Formats](#-output-formats-3)
- [Advanced Options](#-advanced-options)

**When NOT to use Droid:**
- ❌ You need delta streaming (Droid doesn't support incremental text updates)
- ❌ You need interactive workflows (designed for non-interactive execution)
- ❌ You need massive context windows (Gemini handles larger repos better)
- ❌ You need UI/front-end generation (Codex is better for this)
- ❌ You need complex multi-turn reasoning (Claude Opus is better)

**Install CLI:**
```bash
# macOS/Linux
curl -fsSL https://app.factory.ai/cli | sh

# Windows (PowerShell)
irm https://app.factory.ai/cli/windows | iex
```

**Get API Key:**
Generate your API key from the [Factory Settings Page](https://app.factory.ai/settings/api-keys)

**Set Environment Variable:**
```bash
export FACTORY_API_KEY=fk-...
```

**🚀 Start here:**
```bash
droid exec "analyze this folder"
```

**Run a prompt:**
```bash
# Direct prompt (read-only by default)
droid exec "analyze code quality"

# With autonomy level for file operations
droid exec "fix the bug in src/main.js" --auto low

# From file
droid exec -f prompt.md

# Pipe input
echo "summarize repo structure" | droid exec

# Session continuation
droid exec --session-id <session-id> "continue with next steps"
```

### ✅ Why use Droid
- **Non-interactive execution** designed for CI/CD pipelines and automation scripts.
- **Secure by default**: read-only mode with explicit opt-in for mutations via autonomy levels
- **Structured output**: supports text, JSON, and debug formats for automated processing
- **Fail-fast behavior**: stops immediately with clear errors if actions exceed autonomy level
- **Composable**: designed for shell scripting, parallel execution, and pipeline integration

### 💡 Best Use Cases
- **CI/CD automation**: one-shot task execution in pipelines
- **Batch processing**: parallel file processing and analysis
- **Code reviews**: automated analysis with structured output
- **Security audits**: safe read-only analysis of codebases
- **License enforcement**: automated header checking across files

### ⚙️ Autonomy Levels

**Default (read-only):**
- ✅ Reading files, logs, git status, directory listings
- ❌ No modifications to files or system
- **Use case:** Safe analysis and planning

```bash
droid exec "Analyze the authentication system and create a detailed migration plan"
```

**`--auto low`** - Low-risk Operations:
- ✅ File creation/editing in project directories
- ❌ No system modifications or package installations
- **Use case:** Documentation updates, code formatting

```bash
droid exec --auto low "add JSDoc comments to all functions"
```

**`--auto medium`** - Development Operations:
- ✅ Installing packages (npm, pip), git operations (no push), building code
- ❌ No git push, sudo commands, or production changes
- **Use case:** Local development, testing, dependency management

```bash
droid exec --auto medium "install deps, run tests, fix issues"
```

**`--auto high`** - Production Operations:
- ✅ Git push, running untrusted code, production deployments
- ❌ Still blocks: sudo rm -rf /, system-wide changes
- ⚠️ **Factory-side restrictions:** Even at high autonomy, Droid cannot execute certain destructive commands (factory-enforced safety limits)
- **Use case:** CI/CD pipelines, automated deployments

```bash
droid exec --auto high "fix bug, test, commit, and push to main"
```

### ⚙️ Output Formats

**Text (default):**
```bash
droid exec --auto low "create a python file that prints 'hello world'"
```

**JSON (for automation):**
```bash
droid exec "summarize this repository" --output-format json
```

**Debug (streaming):**
```bash
droid exec "run ls command" --output-format debug
```

### ⚙️ Advanced Options

**Working directory:**
```bash
droid exec --cwd /home/runner/work/repo "Map internal packages and dump graphviz DOT to deps.dot"
```

**Model selection:**
```bash
droid exec -m claude-sonnet-4-20250514 -r medium -f plan.md
```

**Supported models:**
- `gpt-5-codex` (default)
- `gpt-5-2025-08-07`
- `claude-sonnet-4-20250514`
- `claude-opus-4-1-20250805`

### ⚠️ Notes
- Default mode is read-only for safety.
- Use `--auto` flags to enable mutations based on risk level.
- Exit code 0 = success, non-zero = failure (use in CI checks).
- Avoid `--skip-permissions-unsafe` unless in isolated environments.

---

## 🎯 Model Selection Cheat Sheet

### By Model Family

| Model | Speed | Reasoning | Context | Cost | Best For |
|-------|-------|-----------|---------|------|----------|
| **Gemini 2.5 Pro** | Medium | High | ★★★★★ (1M tokens) | Medium-High | Massive repos, repo-wide analysis |
| **Gemini 2.5 Flash** | Fast | Medium | ★★★★★ (1M tokens) | Low-Medium | Quick analysis, large context needs |
| **Claude Opus 4.1** | Slow | ★★★★★ | Medium (200K) | High | Deep reasoning, architecture |
| **Claude Sonnet 4.5** | Medium | ★★★★ | Medium (200K) | Medium | Daily coding, balanced |
| **Claude Haiku 4.5** | Fast | ★★★ | Medium (200K) | Low | Quick tasks, budget-conscious |
| **GPT-5 Codex** | Fast | ★★★ | Medium | Medium | UI generation, prototyping |
| **GPT-5** | Medium | ★★★★ | Medium | Medium-High | General purpose |
| **GPT-4.1** | Medium | ★★★ | Medium | Medium | Balanced performance |

### By Use Case

**Massive Context (1M+ tokens):**
- Primary: `Gemini 2.5 Pro` or `Gemini 2.5 Flash`
- Alternative: None (Gemini is unique here)

**Deep Reasoning:**
- Primary: `Claude Opus 4.1`
- Alternative: `Claude Sonnet 4.5` (faster, cheaper)

**UI/Front-end Generation:**
- Primary: `GPT-5 Codex` or `Codex CLI`
- Alternative: `Copilot (gpt-5-codex)`

**Daily Coding:**
- Primary: `Claude Sonnet 4.5`
- Alternative: `Claude Haiku 4.5` (faster, lower cost)

**Budget-Conscious:**
- Primary: `Claude Haiku 4.5` or `Gemini 2.5 Flash`
- Alternative: `GPT-4.1`

**Speed-Critical:**
- Primary: `Claude Haiku 4.5` or `Gemini 2.5 Flash`
- Alternative: `GPT-5 Codex`

---

## 🧮 Model & Agent Recommendations by Task

| Task Type | Recommended Model / Agent | Why |
|------------|---------------------------|-----|
| **Daily coding & feature dev** | `Claude Sonnet` (Claude Code CLI) | Balanced performance and reasoning for code. |
| **Complex architecture or multi-file reasoning** | `Claude Opus` | Deep reasoning and architectural design. |
| **Large repository or long context** | `Gemini 2.5 Pro` (Gemini CLI) | Massive context and strong code understanding. |
| **UI generation / prototyping** | `Codex` or `Copilot (gpt-5-codex)` | Strong at turning prompts into front-end components. |
| **Automation / workflows** | `Cursor Agent`, `Droid Exec`, or `Gemini CLI` (headless) | Ideal for chaining build, test, deploy steps. |
| **CI/CD pipelines** | `Droid Exec` or `Gemini CLI` (headless) | Non-interactive, secure-by-default, structured output. |
| **Code reviews / PR analysis** | `Gemini CLI` (with Code Review extension or headless mode) or `Droid Exec` | Built-in PR analysis and commenting tools. |
| **Low-latency / budget tasks** | `Claude Haiku` or fast Copilot model | Lightweight and fast for everyday prompts. |

---

## 🧪 Example Workflows

### 🧱 Feature Development
```bash
claude -p "Generate a REST API endpoint for user authentication in Node.js with tests"

# With JSON output for automation
result=$(claude -p "Generate a REST API endpoint for user authentication in Node.js with tests" --output-format json)
code=$(echo "$result" | jq -r '.result')
cost=$(echo "$result" | jq -r '.total_cost_usd')
```

### 🏗️ Large Refactor
```bash
gemini -p "Refactor the monorepo: move utils to core/lib and update all imports"

# With JSON output for automation
gemini -p "Refactor the monorepo: move utils to core/lib and update all imports" --output-format json | jq '.response'
```

### 🎨 UI Prototyping
```bash
codex exec "Create a React + Tailwind component library for buttons and forms"

# With structured output
codex exec "Create a React + Tailwind component library for buttons and forms" \
  --output-schema ./ui-schema.json \
  -o ./ui-components.json
```

### ⚙️ Automation Workflow
```bash
# Basic automation
cursor-agent -p "Run eslint + pytest on all changed files and summarize results"

# With file modifications enabled
cursor-agent -p --force "Run eslint + pytest on all changed files, fix issues, and summarize results"

# With structured JSON output
cursor-agent -p --force --output-format json \
  "Run eslint + pytest on all changed files and summarize results" | \
  jq -r '.result'
```

### 🔍 Pull Request Review
```bash
# Interactive review
gemini review --auto-comment --pr-number 123

# Headless mode review
git diff origin/main...HEAD | gemini -p "Review these changes for bugs, security issues, and code quality" --output-format json > pr-review.json
```

### 🤖 CI/CD Automation
```bash
# Batch processing with Droid
find src -name "*.ts" -print0 | xargs -0 -P 4 -I {} \
  droid exec --auto low "Refactor file: {} to use TypeScript patterns"

# License header enforcement
git ls-files "*.ts" | xargs -I {} \
  droid exec --auto low "Ensure {} begins with the Apache-2.0 header; add it if missing"

# Security audit with structured output
droid exec --auto low "Run a quick audit for sync child_process usage and propose fixes; write findings to sec-audit.csv" --output-format json
```

---

## ⚡ Proven Approaches

- **Match model to task**: don't always pick the largest one
- **Claude Sonnet**: everyday workhorse for most dev tasks
- **Claude Opus**: deep refactors and architecture reasoning
- **Gemini**: huge-context or multi-file code reviews
- **Codex/Copilot**: strong for UI and rapid generation
- **Cursor**: strong for automating repetitive or chained workflows
- **Droid**: strong for CI/CD pipelines, batch processing, and secure automation with structured output

Keep CLIs updated to the latest versions for optimal compatibility and performance.

---

## 📌 Version Pinning Guide

CLI versions change frequently. For production CI/CD, pin specific versions:

```bash
# Claude
npm install -g @anthropic-ai/claude-code@1.9.3

# Codex
npm install -g @openai/codex@2.2.0

# Gemini
npm install -g @google/gemini-cli@3.1.0

# Copilot
npm install -g @github/copilot@0.0.329
```

**Note:** Version numbers shown are examples. Check each tool's repository for current stable versions. Update pinning quarterly or when new features are required.

---

## 🔗 References

- [Gemini CLI Docs – Google Developers](https://developers.google.com/gemini-code-assist/docs/gemini-cli)
- [Gemini CLI Headless Mode](https://geminicli.com/docs/cli/headless/)
- [Anthropic Claude Models](https://docs.claude.ai)
- [Claude Code Headless Mode](https://code.claude.com/docs/en/headless.md)
- [OpenAI Codex](https://openai.com/research/codex)
- [Codex SDK - Using Codex CLI Programmatically](https://developers.openai.com/codex/sdk#using-codex-cli-programmatically)
- [Cursor Agent](https://cursor.com/)
- [Cursor CLI Headless Mode](https://cursor.com/docs/cli/headless)
- [GitHub Copilot CLI](https://docs.github.com/en/copilot/cli)
- [About Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli)
- [Factory AI Droid Exec](https://docs.factory.ai/cli/droid-exec/overview.md)
- [AI Model Benchmarks (GetBind)](https://blog.getbind.co/2025/05/23/claude-4-vs-claude-3-7-sonnet-vs-gemini-2-5-pro-which-is-best-for-coding/)
- [AI Model Selection Guide (Eesel)](https://www.eesel.ai/blog/claude-code-model-selection)

---

## 📐 Architecture Overview

### Tool Approval Layers

```text
┌─────────────────────────────────────────────────────────┐
│                    User Prompt                          │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────┐            ┌────▼────┐
    │  CLI    │            │  Agent  │
    │  Layer  │            │  Layer  │
    └────┬────┘            └────┬────┘
         │                       │
    ┌────▼───────────────────────▼────┐
    │     Tool Approval Layer         │
    │  • Trusted directories           │
    │  • Tool allow/deny lists         │
    │  • Autonomy levels (Droid)       │
    │  • Permission modes (Claude)     │
    └────┬────────────────────────────┘
         │
    ┌────▼────────────────────────────┐
    │     Sandbox/Execution Layer      │
    │  • Read-only (default)           │
    │  • File modifications            │
    │  • Shell command execution       │
    │  • Network access                │
    └────┬────────────────────────────┘
         │
    ┌────▼────────────────────────────┐
    │     Output Layer                │
    │  • Text (default)                │
    │  • JSON (structured)             │
    │  • Stream JSON (real-time)       │
    │  • Delta streaming (incremental) │
    └────┬────────────────────────────┘
         │
    ┌────▼────────────────────────────┐
    │     CI/CD Pipeline Integration   │
    │  • Exit codes                    │
    │  • Structured artifacts          │
    │  • Error handling                │
    └──────────────────────────────────┘
```

### Security Model Comparison

**Layered Security Approach:**

1. **Directory Trust** (Copilot, Droid)
   - User confirms trust for working directory
   - Prevents accidental execution in untrusted locations

2. **Tool Approval** (Claude, Copilot)
   - Per-tool permission requests
   - Session-based or permanent approvals
   - Fine-grained control (allow/deny specific commands)

3. **Autonomy Levels** (Droid)
   - Read-only (default)
   - Low/Medium/High risk tiers
   - Fail-fast on permission violations

4. **Sandbox Modes** (Codex)
   - Read-only (default)
   - Workspace-write
   - Danger-full-access (use with caution)

5. **Force Flags** (Cursor)
   - Default: propose changes only
   - `--force`: enable actual file modifications

---

## ⚠️ Limitations & Gotchas

### General Limitations

**Claude:**
- ⚠️ Sometimes refuses tool calls if not explicitly approved; use `--allowedTools` to pre-approve
- ⚠️ Tool approval prompts can interrupt automation workflows; use `--allow-all-tools` with caution
- ⚠️ Context limit smaller than Gemini (200K vs 1M tokens). Claude Opus supports expanded 200K (and occasionally higher in preview), but it's still far below Gemini's million-token capacity.

**Gemini:**
- ⚠️ JSON output includes extensive metadata that may require cleaning for simple parsing
- ⚠️ Slower than smaller models for short prompts (overkill for simple tasks)
- ⚠️ Higher token costs for large context windows

**Codex:**
- ⚠️ Requires Git repository by default (override with `--skip-git-repo-check` if needed). Codex assumes a Git repo because its capabilities rely on diff analysis and file tracking.
- ⚠️ Sandbox modes have different behaviors; `danger-full-access` is truly dangerous
- ⚠️ Structured output schemas must be valid JSON Schema (validation can fail silently)

**Cursor:**
- ⚠️ Delta messages in stream-json can be verbose (lots of small updates)
- ⚠️ Without `--force`, changes are only proposed (not applied); can be confusing
- ⚠️ Streaming JSON parsing requires careful handling of nested structures

**Copilot:**
- ⚠️ Trusted directory scoping is heuristic and not guaranteed to protect all files
- ⚠️ Tool approval system can be bypassed with `--allow-all-tools` (use with extreme caution)
- ⚠️ Can execute shell/git commands without clear warnings in some modes. Shell commands may be executed after the initial trust prompt and tool approval prompts. Programmatic mode (`-p`) can bypass interactive warnings depending on flags.
- ⚠️ Premium request quota applies to each prompt (can exhaust quota quickly)

**Droid:**
- ⚠️ No delta streaming support (only debug format for real-time visibility)
- ⚠️ Autonomy levels are strict; fail-fast behavior can stop workflows unexpectedly
- ⚠️ Read-only by default means file operations require explicit `--auto` flags

### Common Gotchas

1. **Exit Codes**: Not all tools return consistent exit codes; always test in your CI/CD environment
2. **JSON Parsing**: Some tools wrap JSON in additional metadata; use `jq` filters to extract clean data
3. **Session Management**: Resuming sessions requires storing session IDs; easy to lose context
4. **Rate Limits**: All tools have rate limits; use retry logic with exponential backoff
5. **Cost Tracking**: Premium requests consume quotas; monitor usage in production
6. **Version Compatibility**: CLI versions change frequently; pin versions in production
7. **Error Messages**: Some tools have cryptic error messages; check logs and verbose modes

### Troubleshooting Tips

**"Tool not approved" errors:**
- Check tool allow/deny lists
- Verify autonomy levels (Droid) or sandbox modes (Codex)
- Review trusted directory settings (Copilot)

**"Context too large" errors:**
- Use Gemini for massive repos
- Split large tasks into smaller chunks
- Use streaming to process incrementally

**"Unexpected file modifications":**
- Verify `--force` flags (Cursor)
- Check autonomy levels (Droid)
- Review sandbox modes (Codex)

**"JSON parsing fails":**
- Use `jq` to extract specific fields
- Check for metadata wrappers
- Validate JSON Schema (Codex)

---

## 🔍 Troubleshooting Guide

### Quick Diagnostics

**Issue: Tool not found**
```bash
# Check installation
which claude gemini codex cursor-agent copilot droid

# Verify versions
claude --version
gemini --version
codex --version
```

**Issue: Authentication failures**
```bash
# Check API keys
echo $ANTHROPIC_API_KEY
echo $GOOGLE_API_KEY
echo $OPENAI_API_KEY
echo $FACTORY_API_KEY

# Test authentication
claude -p "test" --verbose
```

**Issue: Permission denied**
```bash
# Check file permissions
ls -la ~/.config/claude
ls -la ~/.copilot

# Fix permissions
chmod 600 ~/.config/claude/config.json
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `EACCES: permission denied` | Insufficient file permissions | Use `chmod` to fix permissions |
| `API key not found` | Missing environment variable | Set API key in environment |
| `Context too large` | Input exceeds token limit | Use Gemini or split input |
| `Tool not approved` | Missing tool permissions | Add to `--allowedTools` |
| `Rate limit exceeded` | Too many requests | Implement retry logic |

---

**Created by:** James Hollingsworth
**Last Updated:** November 2025
**Version:** 2.3 (Final polish: technical corrections, Quick Nav sections, version pinning, icon legend, and writing guideline compliance)
**Purpose:** Internal AI review and comparison reference for engineering teams.
