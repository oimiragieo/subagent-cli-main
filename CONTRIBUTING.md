# Contributing to Subagent CLI

Thank you for your interest in contributing to the Subagent CLI project! This document provides guidelines and instructions for contributing.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Project Structure](#project-structure)
5. [Adding New Agents](#adding-new-agents)
6. [Adding New Tools](#adding-new-tools)
7. [Testing](#testing)
8. [Submitting Changes](#submitting-changes)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Collaborate openly and professionally
- Report unacceptable behavior

## Getting Started

### Prerequisites
- Node.js 14.0 or higher
- Git
- Familiarity with JavaScript/Node.js
- Understanding of CLI tools and system administration

### Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/subagent-cli-main.git
cd subagent-cli-main

# Add upstream remote
git remote add upstream https://github.com/enterprise/subagent-cli-main.git
```

## Development Setup

```bash
# Install dependencies
npm install

# Make CLI executable
chmod +x cli.js

# Run in development mode
node cli.js info

# Run tests (when available)
npm test

# Lint code
npm run lint
```

## Project Structure

```
subagent-cli-main/
├── agents/                 # Future: Agent implementations
├── prompts/               # AI agent system prompts
│   ├── devops.md
│   ├── cloud.md
│   ├── security.md
│   ├── data.md
│   ├── system.md
│   └── code.md
├── tools/                 # Tool integrations
│   ├── platform/         # Platform-specific tools
│   │   ├── powershell.js
│   │   └── bash.js
│   └── registry.json     # Tool registry
├── lib/                  # Core library
│   ├── agent-base.js    # Base agent class
│   ├── tool-executor.js # Command execution
│   └── platform-detector.js # Platform detection
├── config/              # Configuration
│   └── config.json
├── examples/           # Usage examples
├── docs/              # Documentation
├── cli.js            # Main CLI entry point
└── package.json
```

## Adding New Agents

### 1. Create Agent Prompt

Create a new markdown file in `prompts/` directory:

```markdown
# Agent Name - System Prompt

## Role and Identity
You are a **[Agent Name] Agent**, specialized in...

## Core Responsibilities
- Responsibility 1
- Responsibility 2

## Available Tools and Usage
...
```

### 2. Update Configuration

Add the agent to `config/config.json`:

```json
{
  "agents": {
    "newagent": {
      "enabled": true,
      "priority": 7,
      "description": "Agent description"
    }
  }
}
```

### 3. Add CLI Command

In `cli.js`, add a new command:

```javascript
program
  .command('newagent <task>')
  .description('Execute new agent task')
  .action(async (task) => {
    await executeAgent('newagent', task);
  });
```

### 4. Document

Update `README.md` and `docs/USAGE.md` with the new agent information.

## Adding New Tools

### 1. Update Tool Registry

Add the tool to `tools/registry.json`:

```json
{
  "name": "toolname",
  "command": "toolname",
  "description": "Tool description",
  "category": "category",
  "platforms": ["windows", "macos", "linux"],
  "agents": ["agent1", "agent2"],
  "versionCommand": "--version",
  "commonCommands": [
    "toolname command1",
    "toolname command2"
  ]
}
```

### 2. Add Tool Instructions

Update relevant agent prompts in `prompts/` with usage instructions for the new tool.

### 3. Create Platform Integration (Optional)

If the tool requires platform-specific handling, add it to `tools/platform/`:

```javascript
// tools/platform/mytool.js
class MyToolIntegration {
  async execute(command, options = {}) {
    // Implementation
  }
}

module.exports = MyToolIntegration;
```

## Testing

### Manual Testing

```bash
# Test agent execution
./cli.js devops "Test task"

# Test tool detection
./cli.js tools

# Test platform detection
./cli.js info
```

### Automated Testing (Future)

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- agent-base.test.js
```

## Submitting Changes

### 1. Create a Branch

```bash
git checkout -b feature/my-new-feature
# or
git checkout -b fix/issue-123
```

### 2. Make Changes

- Write clear, concise code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed

### 3. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add new agent for X"
# or
git commit -m "fix: resolve issue with Y"
```

**Commit Message Format**:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### 4. Push to Your Fork

```bash
git push origin feature/my-new-feature
```

### 5. Create Pull Request

1. Go to GitHub and create a pull request
2. Provide a clear title and description
3. Reference any related issues
4. Wait for review and address feedback

## Code Style Guidelines

### JavaScript

- Use ES6+ features
- Use async/await for asynchronous code
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Keep functions focused and small
- Handle errors appropriately

**Example**:

```javascript
/**
 * Execute a command with proper error handling
 * @param {string} command Command to execute
 * @param {Object} options Execution options
 * @returns {Promise<Object>} Execution result
 */
async function executeCommand(command, options = {}) {
  try {
    // Implementation
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Documentation

- Use clear, concise language
- Provide examples
- Keep README.md up to date
- Document breaking changes
- Include platform-specific notes when relevant

### Configuration

- Use JSON for configuration files
- Provide sensible defaults
- Document all configuration options
- Support environment variables where appropriate

## Review Process

1. **Automated Checks**: Code passes linting and tests
2. **Code Review**: Maintainer reviews code quality and design
3. **Testing**: Changes are tested on multiple platforms
4. **Documentation**: Documentation is updated as needed
5. **Merge**: Changes are merged into main branch

## Release Process

1. Version bump in `package.json`
2. Update `CHANGELOG.md`
3. Create release tag
4. Publish to npm (if applicable)
5. Update documentation

## Questions and Support

- **Questions**: Open a GitHub issue with the "question" label
- **Bug Reports**: Open a GitHub issue with the "bug" label
- **Feature Requests**: Open a GitHub issue with the "enhancement" label
- **Security Issues**: Email security@example.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Subagent CLI! Your efforts help make this tool better for everyone.
