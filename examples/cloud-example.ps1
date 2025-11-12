# Cloud Agent Example Usage (PowerShell)
# This script demonstrates various cloud tasks

Write-Host "=== Cloud Agent Examples ===" -ForegroundColor Cyan
Write-Host ""

# Example 1: AWS EC2 management
Write-Host "Example 1: AWS EC2 instance management" -ForegroundColor Yellow
node ..\cli.js cloud "List all EC2 instances in us-east-1 region"
Write-Host ""

# Example 2: Azure resource management
Write-Host "Example 2: Azure resource group creation" -ForegroundColor Yellow
node ..\cli.js cloud "Create Azure resource group in East US location"
Write-Host ""

# Example 3: GCP storage
Write-Host "Example 3: GCP Cloud Storage bucket" -ForegroundColor Yellow
node ..\cli.js cloud "Create GCP storage bucket with versioning enabled"
Write-Host ""

# Example 4: Multi-cloud cost analysis
Write-Host "Example 4: Multi-cloud cost analysis" -ForegroundColor Yellow
node ..\cli.js cloud "Generate cost report for AWS, Azure, and GCP resources"
Write-Host ""

# Example 5: Cloud backup
Write-Host "Example 5: Cloud backup configuration" -ForegroundColor Yellow
node ..\cli.js cloud "Configure automated backups for all databases across cloud providers"
Write-Host ""
