# Windows System Enumeration Example
# Demonstrates comprehensive Windows system enumeration using the System Agent

Write-Host "=== Windows System Enumeration Examples ===" -ForegroundColor Cyan
Write-Host ""

# Example 1: System Information
Write-Host "Example 1: Gather comprehensive system information" -ForegroundColor Yellow
node ..\cli.js system "Display Windows version, hotfixes, and system architecture"
Write-Host ""

# Example 2: Process Enumeration
Write-Host "Example 2: Enumerate all running processes with command line arguments" -ForegroundColor Yellow
node ..\cli.js system "List all running processes showing executable path and PID"
Write-Host ""

# Example 3: Service Enumeration
Write-Host "Example 3: List all Windows services and their status" -ForegroundColor Yellow
node ..\cli.js system "Show all services with their status and startup type"
Write-Host ""

# Example 4: Network Configuration
Write-Host "Example 4: Display network configuration and connections" -ForegroundColor Yellow
node ..\cli.js system "Show network interfaces, IP addresses, and active connections"
Write-Host ""

# Example 5: Registry Analysis
Write-Host "Example 5: Query important registry keys" -ForegroundColor Yellow
node ..\cli.js system "Display Windows startup programs from registry Run keys"
Write-Host ""

# Example 6: Event Log Analysis
Write-Host "Example 6: Analyze Windows event logs" -ForegroundColor Yellow
node ..\cli.js system "Show recent security and system events from Windows Event Viewer"
Write-Host ""

# Example 7: User Enumeration
Write-Host "Example 7: Enumerate local users and groups" -ForegroundColor Yellow
node ..\cli.js system "List all local users and administrators group members"
Write-Host ""

# Example 8: Scheduled Tasks
Write-Host "Example 8: List scheduled tasks" -ForegroundColor Yellow
node ..\cli.js system "Display all scheduled tasks and their configurations"
Write-Host ""

# Example 9: File Search
Write-Host "Example 9: Search for specific files" -ForegroundColor Yellow
node ..\cli.js system "Find all PDF files in user directories"
Write-Host ""

# Example 10: Security Assessment
Write-Host "Example 10: Security configuration check" -ForegroundColor Yellow
node ..\cli.js system "Check firewall status, anti-virus status, and Windows Defender configuration"
Write-Host ""

Write-Host "`n=== Advanced Windows Administration ===" -ForegroundColor Cyan
Write-Host ""

# Example 11: Volume Shadow Copy
Write-Host "Example 11: Volume Shadow Service enumeration" -ForegroundColor Yellow
node ..\cli.js system "List all volume shadow copies and their details"
Write-Host ""

# Example 12: Remote System Enumeration
Write-Host "Example 12: Remote system information (requires credentials)" -ForegroundColor Yellow
Write-Host "Usage: node ..\cli.js system 'Get system information from remote computer at IP 192.168.1.100'" -ForegroundColor Gray
Write-Host ""

# Example 13: Performance Monitoring
Write-Host "Example 13: System performance monitoring" -ForegroundColor Yellow
node ..\cli.js system "Display CPU usage, memory usage, and disk I/O statistics"
Write-Host ""

# Example 14: USB Device History
Write-Host "Example 14: Enumerate USB device history" -ForegroundColor Yellow
node ..\cli.js system "List all USB devices that have been connected to the system"
Write-Host ""

# Example 15: Network Share Enumeration
Write-Host "Example 15: List network shares" -ForegroundColor Yellow
node ..\cli.js system "Display all shared folders and their permissions"
Write-Host ""

Write-Host "`nFor more details, see docs/WINDOWS-REFERENCE.md" -ForegroundColor Green
