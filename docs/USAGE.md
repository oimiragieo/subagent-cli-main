# Subagent CLI - Usage Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Agent Overview](#agent-overview)
3. [Command Reference](#command-reference)
4. [Platform-Specific Usage](#platform-specific-usage)
5. [Advanced Features](#advanced-features)
6. [Examples](#examples)

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd subagent-cli-main

# Install dependencies
npm install

# Make CLI executable
chmod +x cli.js

# Optional: Install globally
npm link
```

### Quick Start

```bash
# Check system information
./cli.js info

# List available agents
./cli.js agents

# Execute a task
./cli.js devops "Check Docker container status"

# Interactive mode
./cli.js interactive
```

## Agent Overview

### DevOps Agent

**Purpose**: CI/CD, containerization, infrastructure automation

**Common Use Cases**:

- Building and deploying Docker containers
- Kubernetes cluster management
- Infrastructure as Code (Terraform, Ansible)
- Pipeline automation
- Monitoring and logging

**Example**:

```bash
./cli.js devops "Deploy application to Kubernetes with 3 replicas"
```

### Cloud Agent

**Purpose**: Multi-cloud infrastructure management

**Common Use Cases**:

- AWS resource management
- Azure infrastructure
- GCP operations
- Multi-cloud deployments
- Cost optimization

**Example**:

```bash
./cli.js cloud "List all EC2 instances in production VPC"
```

### Security Agent

**Purpose**: Security auditing, compliance, penetration testing

**Common Use Cases**:

- Vulnerability scanning
- Security audits
- Compliance checks
- Firewall configuration
- Access control management

**Example**:

```bash
./cli.js security "Scan network for open ports and vulnerabilities"
```

### Data Agent

**Purpose**: Data engineering, database management, ETL

**Common Use Cases**:

- Database operations
- Data pipeline creation
- ETL processes
- Data quality checks
- Analytics queries

**Example**:

```bash
./cli.js data "Export PostgreSQL database to CSV files"
```

### System Agent

**Purpose**: System administration and monitoring

**Common Use Cases**:

- Service management
- Performance monitoring
- Log analysis
- User management
- System maintenance

**Example**:

```bash
./cli.js system "Check system performance and disk usage"
```

### Code Agent

**Purpose**: Software development, testing, build automation

**Common Use Cases**:

- Dependency management
- Running tests
- Code analysis
- Build processes
- Git operations

**Example**:

```bash
./cli.js code "Run all tests and generate coverage report"
```

## Command Reference

### Global Commands

#### info

Display system and platform information

```bash
./cli.js info
```

#### agents

List all available agents

```bash
./cli.js agents
```

#### tools

List available CLI tools

```bash
./cli.js tools                    # All tools
./cli.js tools --category devops  # Specific category
```

#### interactive

Start interactive mode

```bash
./cli.js interactive
# or
./cli.js i
```

### Agent Commands

Each agent can be invoked with a task description:

```bash
./cli.js <agent> "<task description>"
```

**Options**:

- `-p, --platform <platform>`: Override platform detection
- `-s, --shell <shell>`: Override default shell
- `-v, --verbose`: Enable verbose output
- `--no-color`: Disable colored output
- `-c, --config <path>`: Use custom config file

### Examples

```bash
# DevOps
./cli.js devops "Build Docker image and push to ECR"
./cli.js devops --verbose "Deploy to production Kubernetes cluster"

# Cloud
./cli.js cloud "Create S3 bucket with versioning"
./cli.js cloud --platform windows "List all Azure VMs"

# Security
./cli.js security "Run security audit on system"

# Data
./cli.js data "Backup all PostgreSQL databases"

# System
./cli.js system "Restart nginx service"
./cli.js system --verbose "Analyze system logs for errors"

# Code
./cli.js code "Install npm dependencies and run tests"
```

## Platform-Specific Usage

### Windows (PowerShell)

```powershell
# Basic usage
.\cli.js devops "Task description"

# With PowerShell-specific tools
.\cli.js system "Get-Service | Where-Object {$_.Status -eq 'Running'}"

# Cloud operations
.\cli.js cloud "Deploy to Azure App Service"
```

### macOS (Bash/Zsh)

```bash
# Basic usage
./cli.js devops "Task description"

# Using Homebrew tools
./cli.js system "Update all Homebrew packages"

# Development tasks
./cli.js code "Build Xcode project"
```

### Linux (Bash)

```bash
# Basic usage
./cli.js devops "Task description"

# System administration
./cli.js system "Check systemd service status"

# Security operations
./cli.js security "Update and apply security patches"
```

## Advanced Features

### Configuration

Edit `config/config.json` to customize:

```json
{
  "platform": "auto",
  "defaultShell": "auto",
  "agents": {
    "devops": { "enabled": true },
    "cloud": { "enabled": true }
  },
  "tools": {
    "allowList": ["*"],
    "autoDetect": true
  }
}
```

### Environment Variables

Set environment variables for cloud providers:

```bash
# AWS
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_DEFAULT_REGION=us-east-1

# Azure
export AZURE_SUBSCRIPTION_ID=your_subscription
export AZURE_TENANT_ID=your_tenant

# GCP
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

### Scripting

Use in shell scripts:

```bash
#!/bin/bash

# Automated deployment script
./cli.js code "Run tests"
if [ $? -eq 0 ]; then
  ./cli.js devops "Build Docker image"
  ./cli.js cloud "Deploy to production"
fi
```

### Piping and Output

```bash
# Capture output
./cli.js system "List running processes" > processes.txt

# Pipe to other commands
./cli.js data "Query database" | grep "error"

# JSON output (if configured)
./cli.js cloud "List instances" | jq '.instances[]'
```

## Examples

### Complete Workflow: Deploy Application

```bash
# 1. Run tests
./cli.js code "Run all unit and integration tests"

# 2. Build container
./cli.js devops "Build Docker image from current directory"

# 3. Security scan
./cli.js security "Scan Docker image for vulnerabilities"

# 4. Push to registry
./cli.js devops "Push Docker image to container registry"

# 5. Deploy to cloud
./cli.js cloud "Deploy container to AWS ECS production cluster"

# 6. Verify deployment
./cli.js cloud "Check health of deployed application"

# 7. Monitor
./cli.js system "Set up monitoring and alerting for application"
```

### Database Migration

```bash
# 1. Backup current database
./cli.js data "Create backup of production database"

# 2. Run migrations
./cli.js data "Apply pending database migrations"

# 3. Verify data integrity
./cli.js data "Run data validation checks"

# 4. Analyze performance
./cli.js data "Analyze query performance and suggest optimizations"
```

### Security Audit

```bash
# 1. System scan
./cli.js security "Run comprehensive system security scan"

# 2. Network scan
./cli.js security "Scan network for open ports and services"

# 3. Check compliance
./cli.js security "Verify CIS benchmark compliance"

# 4. Update systems
./cli.js system "Apply all security updates"

# 5. Verify hardening
./cli.js security "Verify security hardening measures"
```

### Infrastructure Setup

```bash
# 1. Provision infrastructure
./cli.js cloud "Create VPC with public and private subnets in AWS"

# 2. Configure networking
./cli.js cloud "Set up load balancer and security groups"

# 3. Deploy databases
./cli.js cloud "Create RDS PostgreSQL database with backups"

# 4. Set up monitoring
./cli.js devops "Configure CloudWatch monitoring and alerts"

# 5. Deploy application
./cli.js devops "Deploy application to ECS cluster"
```

## Troubleshooting

### Common Issues

**Issue**: Agent not found

```bash
# Solution: Check if agent is enabled in config
./cli.js agents
```

**Issue**: Permission denied

```bash
# Solution: Check file permissions or run with appropriate privileges
chmod +x cli.js
```

**Issue**: Tool not available

```bash
# Solution: Check available tools and install if needed
./cli.js tools
```

### Verbose Mode

Enable verbose output for debugging:

```bash
./cli.js --verbose devops "Task description"
```

### Logs

Check log files:

```bash
cat logs/subagent-cli.log
```

## Support

For issues, questions, or contributions:

- Documentation: `docs/`
- Examples: `examples/`
- Issue Tracker: GitHub Issues
- Contributing: See `CONTRIBUTING.md`
