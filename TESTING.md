# Testing Guide

This document describes how to test the Subagent CLI framework to ensure everything works correctly.

---

## 🧪 Testing Levels

### 1. Installation Testing

**Purpose:** Verify the project installs correctly from scratch

**Steps:**
```bash
# Fresh clone
git clone <repo-url>
cd subagent-cli-main

# Install dependencies
npm install

# Should show next steps
# Output: ✨ Dependencies installed! Next steps:...

# Build TypeScript
npm run build

# Should compile without errors
# Output: Successfully compiled X files

# Verify installation
npm run verify

# Should pass all checks
# Output: ✓ Installation verification PASSED
```

**Success Criteria:**
- ✅ No installation errors
- ✅ All dependencies installed
- ✅ TypeScript compiles successfully
- ✅ Verification script passes

---

### 2. Configuration Testing

**Purpose:** Verify configuration setup works correctly

**Steps:**
```bash
# Create environment file
cp .env.example .env

# Edit .env and add API key
nano .env
# Add: ANTHROPIC_API_KEY=sk-ant-your-key-here

# Verify env is loaded
node -e "require('dotenv').config(); console.log(process.env.ANTHROPIC_API_KEY ? 'API key loaded' : 'API key missing')"

# Copy config (optional)
cp config/config.example.json config/config.json

# Verify config loads
node -e "const c = require('./config/config.json'); console.log('Config loaded:', c.version)"
```

**Success Criteria:**
- ✅ .env.example has all required fields
- ✅ API key loads correctly
- ✅ Config file is valid JSON
- ✅ Config loads without errors

---

### 3. CLI Command Testing

**Purpose:** Verify all CLI commands work

#### Basic Commands

```bash
# Test version
node cli.js --version
# Expected: 1.0.0

# Test help
node cli.js --help
# Expected: Show all commands

# Test info
node cli.js info
# Expected: Display system information

# Test agents list
node cli.js agents
# Expected: Show 6 enabled agents

# Test tools list
node cli.js tools
# Expected: Show available tools
```

#### Agent Commands (Without API)

```bash
# These will fail without API key but should show proper errors

# DevOps agent
node cli.js devops "Test task"
# Expected: Error about API key or attempt to connect

# Cloud agent
node cli.js cloud "Test task"

# Security agent
node cli.js security "Test task"

# Data agent
node cli.js data "Test task"

# System agent
node cli.js system "Test task"

# Code agent
node cli.js code "Test task"
```

**Success Criteria:**
- ✅ All commands recognized
- ✅ Help text displays correctly
- ✅ Proper error messages for missing API key
- ✅ No crashes or stack traces

---

### 4. Platform Testing

**Purpose:** Verify cross-platform compatibility

#### Linux Testing

```bash
# Run on Ubuntu/Debian
./scripts/test-linux.sh

# Check platform detection
node cli.js info | grep "Platform: linux"

# Test bash shell
node -e "const p = require('./lib/platform-detector'); console.log(new p().getPlatformInfo().defaultShell.name)"
# Expected: bash or zsh
```

#### macOS Testing

```bash
# Run on macOS
./scripts/test-macos.sh

# Check platform detection
node cli.js info | grep "Platform: macos"

# Test shell detection
node cli.js info | grep -E "bash|zsh"
```

#### Windows Testing

```powershell
# Run on Windows
.\scripts\test-windows.ps1

# Check platform detection
node cli.js info | Select-String "Platform: windows"

# Test PowerShell detection
node cli.js info | Select-String "powershell"
```

**Success Criteria:**
- ✅ Platform detected correctly
- ✅ Default shell detected correctly
- ✅ All shells listed
- ✅ Hardware info displayed

---

### 5. Tool Detection Testing

**Purpose:** Verify tool registry and detection works

```bash
# List all tools
npm run tools

# List tools by category
node cli.js tools -c devops
node cli.js tools -c cloud
node cli.js tools -c security
node cli.js tools -c data
node cli.js tools -c system

# Check specific tool availability
which docker
which kubectl
which aws
which az
which gcloud
```

**Success Criteria:**
- ✅ Tool registry loads
- ✅ Tools categorized correctly
- ✅ Available tools marked
- ✅ Missing tools noted

---

### 6. Interactive Mode Testing

**Purpose:** Verify interactive mode works

```bash
# Start interactive mode
node cli.js interactive

# Follow prompts:
# 1. Select agent
# 2. Enter task
# 3. Confirm execution
# 4. View results
```

**Success Criteria:**
- ✅ Interactive menu appears
- ✅ All agents selectable
- ✅ Task input works
- ✅ Execution proceeds correctly

---

### 7. Agent Integration Testing

**Purpose:** Test agents with real API calls (requires API key)

#### DevOps Agent

```bash
# Test Docker operations
node cli.js devops "Check if Docker is installed and running"

# Test Git operations
node cli.js devops "Show current git branch and status"

# Test system commands
node cli.js devops "List running processes"
```

#### Cloud Agent

```bash
# Test AWS (requires aws-cli)
node cli.js cloud "Show AWS CLI version"

# Test Azure (requires az-cli)
node cli.js cloud "Show Azure CLI version"

# Test GCP (requires gcloud)
node cli.js cloud "Show gcloud version"
```

#### Security Agent

```bash
# Test port scanning
node cli.js security "Scan localhost for open ports"

# Test dependency checking
node cli.js security "Check package.json for vulnerabilities"
```

#### System Agent

```bash
# Test system info
node cli.js system "Show CPU and memory usage"

# Test disk info
node cli.js system "Show disk usage"

# Test network info
node cli.js system "Show network interfaces"
```

#### Data Agent

```bash
# Test database connection (if available)
node cli.js data "Check if PostgreSQL is installed"

# Test data analysis
node cli.js data "Analyze package.json file"
```

#### Code Agent

```bash
# Test code analysis
node cli.js code "Analyze code quality in lib/"

# Test dependency check
node cli.js code "List npm dependencies"
```

**Success Criteria:**
- ✅ Agents execute without crashing
- ✅ Proper API communication
- ✅ Meaningful responses
- ✅ Error handling works

---

### 8. Error Handling Testing

**Purpose:** Verify errors are handled gracefully

#### Missing API Key

```bash
# Remove API key
unset ANTHROPIC_API_KEY

# Try to run agent
node cli.js devops "Test"
# Expected: Clear error about missing API key
```

#### Invalid API Key

```bash
# Set invalid key
export ANTHROPIC_API_KEY="invalid-key"

# Try to run agent
node cli.js devops "Test"
# Expected: API authentication error
```

#### Missing Config

```bash
# Rename config
mv config/config.json config/config.json.bak

# Try to run
node cli.js info
# Expected: Error about missing config
```

#### Missing Tool

```bash
# Try to use missing tool
node cli.js devops "Deploy with kubectl"
# (If kubectl not installed)
# Expected: Warning about missing tool
```

**Success Criteria:**
- ✅ Clear error messages
- ✅ No stack traces exposed to users
- ✅ Helpful suggestions provided
- ✅ Graceful degradation

---

### 9. Performance Testing

**Purpose:** Verify performance is acceptable

```bash
# Time CLI startup
time node cli.js --help

# Time info command
time node cli.js info

# Time agent execution
time node cli.js system "Show system info"

# Memory usage
/usr/bin/time -v node cli.js info
```

**Success Criteria:**
- ✅ CLI starts in < 1 second
- ✅ Info command completes in < 2 seconds
- ✅ Memory usage is reasonable
- ✅ No memory leaks

---

### 10. Documentation Testing

**Purpose:** Verify documentation is accurate

```bash
# Check all referenced files exist
test -f README.md && echo "✓ README.md"
test -f QUICKSTART.md && echo "✓ QUICKSTART.md"
test -f CONTRIBUTING.md && echo "✓ CONTRIBUTING.md"
test -f .env.example && echo "✓ .env.example"
test -f config/config.example.json && echo "✓ config/config.example.json"

# Check documentation links
# (Manual review of README.md links)

# Try examples from README
# (Copy-paste and test each example)

# Try QUICKSTART steps
# (Follow QUICKSTART.md from scratch)
```

**Success Criteria:**
- ✅ All referenced files exist
- ✅ All links work
- ✅ Examples run correctly
- ✅ QUICKSTART guide works end-to-end

---

## 🤖 Automated Testing

### Run All Automated Tests

```bash
# Run verification
npm run verify

# Run linting
npm run lint

# Run formatting check
npm run format -- --check

# Run build
npm run build

# Run unit tests (when available)
npm test
```

### Create Test Script

Create `scripts/run-all-tests.sh`:

```bash
#!/bin/bash

echo "Running all tests..."

# Verification
echo "1. Running verification..."
npm run verify || exit 1

# Linting
echo "2. Running linting..."
npm run lint || exit 1

# Build
echo "3. Building TypeScript..."
npm run build || exit 1

# CLI commands
echo "4. Testing CLI commands..."
node cli.js --version || exit 1
node cli.js info || exit 1
node cli.js agents || exit 1
node cli.js tools || exit 1

echo "✅ All tests passed!"
```

---

## 📋 Test Checklist

Use this checklist for manual testing:

### Installation
- [ ] Fresh clone works
- [ ] npm install completes
- [ ] npm run build succeeds
- [ ] npm run verify passes

### Configuration
- [ ] .env.example exists
- [ ] config.example.json exists
- [ ] Config loads correctly
- [ ] API key loads correctly

### CLI Commands
- [ ] --help works
- [ ] --version works
- [ ] info works
- [ ] agents works
- [ ] tools works
- [ ] All 6 agent commands recognized

### Platform Support
- [ ] Tested on Linux
- [ ] Tested on macOS
- [ ] Tested on Windows
- [ ] Platform detection works

### Documentation
- [ ] README examples work
- [ ] QUICKSTART guide works
- [ ] All links valid
- [ ] No broken references

### Error Handling
- [ ] Missing API key handled
- [ ] Invalid API key handled
- [ ] Missing config handled
- [ ] Missing tools handled gracefully

---

## 🐛 Bug Reporting

If you find bugs during testing:

1. **Check existing issues:** Search GitHub issues
2. **Create bug report:** Use `.github/ISSUE_TEMPLATE/bug_report.md`
3. **Include test output:** Paste relevant error messages
4. **Describe environment:** OS, Node version, etc.

---

## 📊 Test Coverage

Current test coverage:

| Component | Coverage | Status |
|-----------|----------|--------|
| Installation | Manual | ✅ |
| Configuration | Manual | ✅ |
| CLI Commands | Manual | ✅ |
| Platform Detection | Manual | ✅ |
| Tool Detection | Manual | ✅ |
| Agent Execution | Manual (requires API) | ⚠️ |
| Error Handling | Manual | ✅ |
| Documentation | Manual | ✅ |
| Unit Tests | 0% | ❌ |
| Integration Tests | 0% | ❌ |

**Note:** Automated unit and integration tests are planned for future releases.

---

## 🎯 Next Steps

To improve testing:

1. **Add Jest unit tests** for all lib/ modules
2. **Add integration tests** for agent execution
3. **Add E2E tests** for complete workflows
4. **Set up CI/CD** with GitHub Actions
5. **Add code coverage** reporting
6. **Create test fixtures** for consistent testing

---

**For questions about testing, see [CONTRIBUTING.md](CONTRIBUTING.md) or open an issue.**
