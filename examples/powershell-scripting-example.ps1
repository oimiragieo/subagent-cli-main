# PowerShell Scripting Examples for Code Agent
# Demonstrates PowerShell development and automation capabilities

Write-Host "=== PowerShell Scripting Examples ===" -ForegroundColor Cyan
Write-Host ""

# Example 1: Script Development
Write-Host "Example 1: Develop and test PowerShell script with parameters and error handling" -ForegroundColor Yellow
node ..\cli.js code "Create a PowerShell script that backs up files with logging and error handling"
Write-Host ""

# Example 2: Automation Scripts
Write-Host "Example 2: Build automation script for .NET projects" -ForegroundColor Yellow
node ..\cli.js code "Write PowerShell script to build all .csproj files in directory recursively"
Write-Host ""

# Example 3: Data Processing
Write-Host "Example 3: Process JSON data with PowerShell" -ForegroundColor Yellow
node ..\cli.js code "Create PowerShell script to parse JSON API response and export to CSV"
Write-Host ""

# Example 4: System Monitoring
Write-Host "Example 4: System monitoring script" -ForegroundColor Yellow
node ..\cli.js code "Write PowerShell script to monitor CPU and memory and alert if thresholds exceeded"
Write-Host ""

# Example 5: File Operations
Write-Host "Example 5: Batch file processing" -ForegroundColor Yellow
node ..\cli.js code "Create PowerShell script to find and process log files older than 30 days"
Write-Host ""

Write-Host "`n=== PowerShell One-Liner Examples ===" -ForegroundColor Cyan
Write-Host ""

# Example 6: Network Operations
Write-Host "Example 6: Network port scanner one-liner" -ForegroundColor Yellow
Write-Host 'Usage: $ports=(80,443,3389);$ip="192.168.1.1";foreach ($port in $ports){try{$socket=New-Object System.Net.Sockets.TCPClient($ip,$port);}catch{};if ($socket -eq $NULL){echo "$ip:$port - Closed"}else{echo "$ip:$port - Open";$socket = $NULL;}}' -ForegroundColor Gray
Write-Host ""

# Example 7: System Information
Write-Host "Example 7: Export system information to CSV" -ForegroundColor Yellow
Write-Host "Usage: Get-WmiObject -Class win32_operatingsystem | Select-Object -Property * | Export-Csv system-info.csv" -ForegroundColor Gray
Write-Host ""

# Example 8: Service Management
Write-Host "Example 8: List and export running services" -ForegroundColor Yellow
Write-Host "Usage: Get-Service | Where-Object {`$_.Status -eq 'Running'} | Export-Csv running-services.csv" -ForegroundColor Gray
Write-Host ""

# Example 9: File Search
Write-Host "Example 9: Find files modified in last 24 hours" -ForegroundColor Yellow
Write-Host 'Usage: Get-ChildItem -Path C:\ -Recurse -ErrorAction SilentlyContinue | Where-Object {$_.LastWriteTime -gt (Get-Date).AddDays(-1)}' -ForegroundColor Gray
Write-Host ""

# Example 10: Remote Operations
Write-Host "Example 10: Execute command on remote computer" -ForegroundColor Yellow
Write-Host "Usage: Invoke-Command -ComputerName SERVER01 -ScriptBlock {Get-Process}" -ForegroundColor Gray
Write-Host ""

Write-Host "`n=== Batch Script Examples ===" -ForegroundColor Cyan
Write-Host ""

# Example 11: Network Scanning
Write-Host "Example 11: Ping sweep batch script" -ForegroundColor Yellow
Write-Host "Usage: for /L %i in (1,1,254) do @ping -n 1 -w 100 192.168.1.%i | find `"Reply`" && echo 192.168.1.%i >> live.txt" -ForegroundColor Gray
Write-Host ""

# Example 12: File Processing
Write-Host "Example 12: Loop through file lines" -ForegroundColor Yellow
Write-Host 'Usage: for /F "tokens=*" %%A in (users.txt) do echo %%A' -ForegroundColor Gray
Write-Host ""

# Example 13: DNS Lookups
Write-Host "Example 13: DNS reverse lookup batch script" -ForegroundColor Yellow
Write-Host 'Usage: for /L %P in (1,1,254) do nslookup 192.168.1.%P | findstr /i /c:"Name" >> dns.txt' -ForegroundColor Gray
Write-Host ""

Write-Host "`n=== Development Automation Examples ===" -ForegroundColor Cyan
Write-Host ""

# Example 14: Build Automation
Write-Host "Example 14: Automate builds for multiple projects" -ForegroundColor Yellow
node ..\cli.js code "Write PowerShell script to build and test multiple projects in sequence"
Write-Host ""

# Example 15: Deployment Script
Write-Host "Example 15: Automated deployment script" -ForegroundColor Yellow
node ..\cli.js code "Create PowerShell script to build Docker images and push to registry"
Write-Host ""

# Example 16: Testing Automation
Write-Host "Example 16: Run tests and generate reports" -ForegroundColor Yellow
node ..\cli.js code "Write PowerShell script to run all tests and generate combined coverage report"
Write-Host ""

# Example 17: Environment Setup
Write-Host "Example 17: Development environment setup script" -ForegroundColor Yellow
node ..\cli.js code "Create PowerShell script to install dev dependencies and configure environment"
Write-Host ""

# Example 18: Code Quality Checks
Write-Host "Example 18: Run linters and formatters" -ForegroundColor Yellow
node ..\cli.js code "Write PowerShell script to run ESLint, Prettier, and generate quality report"
Write-Host ""

# Example 19: Git Automation
Write-Host "Example 19: Git workflow automation" -ForegroundColor Yellow
node ..\cli.js code "Create PowerShell script to automate git commit, tag, and push workflow"
Write-Host ""

# Example 20: API Testing
Write-Host "Example 20: API endpoint testing script" -ForegroundColor Yellow
node ..\cli.js code "Write PowerShell script to test multiple API endpoints and validate responses"
Write-Host ""

Write-Host "`nFor detailed PowerShell and Batch scripting reference, see:" -ForegroundColor Green
Write-Host "docs/POWERSHELL-BATCH-SCRIPTS.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "For Windows system administration, see:" -ForegroundColor Green
Write-Host "docs/WINDOWS-REFERENCE.md" -ForegroundColor Yellow
