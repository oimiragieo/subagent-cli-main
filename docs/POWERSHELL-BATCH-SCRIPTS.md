# PowerShell and Batch Script Reference

## Table of Contents
1. [PowerShell Basics](#powershell-basics)
2. [PowerShell One-Liners](#powershell-one-liners)
3. [Batch Scripts](#batch-scripts)
4. [Advanced PowerShell Techniques](#advanced-powershell-techniques)
5. [Security Considerations](#security-considerations)

---

## PowerShell Basics

### Core Commands

```powershell
# Stop recording PowerShell transcript
Stop-Transcript

# Display file contents
Get-Content <FILE_PATH>

# Show command examples
Get-Help <COMMAND> -Examples

# Search for commands
Get-Command *<STRING_TO_SEARCH>*

# Display services
Get-Service
Stop-Service <SERVICE_NAME>
Start-Service <SERVICE_NAME>

# Display services with WMI (accepts alternate credentials)
Get-WmiObject -Class win32_service

# Display PowerShell version
$psVersionTable
$PSVersionTable.PSVersion

# Run PowerShell 2.0 from PowerShell 3.0+
powershell -version 2.0

# Count services
Get-Service | Measure-Object

# Display drives in current session
Get-PSDrive

# Get only process names
Get-Process | Select-Object -ExpandProperty name

# Find cmdlets that accept credentials
Get-Help * -Parameter credential

# Available WMI network commands
Get-WmiObject -List *network*

# DNS lookup
[Net.DNS]::GetHostEntry("<IP_ADDRESS>")
```

### PowerShell Execution Policy

```powershell
# Get current execution policy
Get-ExecutionPolicy

# Set execution policy (requires admin)
Set-ExecutionPolicy Unrestricted
Set-ExecutionPolicy RemoteSigned
Set-ExecutionPolicy Bypass

# Bypass execution policy for single script
powershell -ExecutionPolicy Bypass -File <FILE_PATH>
powershell -ep bypass -nop -File <FILE_PATH>

# Launch PowerShell with bypass
powershell -ep bypass -nop
```

### Working with Objects

```powershell
# Select specific properties
Get-Process | Select-Object Name, Id, CPU

# Expand property
Get-Process | Select-Object -ExpandProperty Name

# Filter objects
Get-Service | Where-Object {$_.Status -eq "Running"}
Get-Process | Where-Object {$_.CPU -gt 100}

# Sort objects
Get-Process | Sort-Object CPU -Descending

# Group objects
Get-Service | Group-Object Status

# Measure objects
Get-ChildItem | Measure-Object -Property Length -Sum
```

---

## PowerShell One-Liners

### Network Operations

#### Port Scanner
```powershell
# Scan multiple ports on a single host
$ports=(80,443,3389,22,21,25);$ip="<IP_ADDRESS>";foreach ($port in $ports){try{$socket=New-Object System.Net.Sockets.TCPClient($ip,$port);}catch{};if ($socket -eq $NULL){echo $ip":"$port" - Closed";}else{echo $ip":"$port" - Open";$socket = $NULL;}}
```

#### Ping Host
```powershell
# Ping with timeout
$ping = New-Object System.Net.Networkinformation.ping;$ping.Send("<IP_ADDRESS>",500)
```

#### Get Active TCP Connections
```powershell
# PowerShell network connections (equivalent to netstat)
[System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpConnections()
```

### Credential and Authentication

#### Prompt for Credentials
```powershell
# Hidden window credential prompt
powershell -WindowStyle Hidden -ExecutionPolicy Bypass
$Host.UI.PromptForCredential("<WINDOW_TITLE>","<MESSAGE>","<USERNAME>","<DOMAIN>")
```

#### Execute with Credentials
```powershell
# Create credential object and execute
$password = ConvertTo-SecureString -String "<PASSWORD>" -AsPlainText -Force;
$cred = New-Object -TypeName System.Management.Automation.PSCredential -ArgumentList "<DOMAIN>\<USERNAME>", $password;
Start-Process powershell -Credential $cred -ArgumentList '-noprofile -command &{Start-Process <FILE_PATH> -verb runas}'
```

### Scheduled Execution

#### Time-Based Execution
```powershell
# Run file every 4 hours between specific dates
powershell -Command "do {if ((Get-Date -format YYYYMMDD-HHMM) -match '202208(0[8-9]|1[0-1])(0[8-9]|1[0-7])[0-5][0-9]'){Start-Process -WindowStyle Hidden '<FILE_PATH>';Start-Sleep -s 14400}}while(1)"
```

### Email Operations

#### Send Email with Attachment
```powershell
# Send email with SMTP
Send-MailMessage -to "<EMAIL>" -from "<EMAIL>" -subject "<SUBJECT>" -Attachments "<FILE_PATH>" -Body "<BODY>" -SmtpServer "<IP_ADDRESS>" -Port "<PORT>" -Credential "<PS_CRED_OBJECT>" -UseSsl
```

### File Operations

#### Download File from Web
```powershell
# Download file via HTTP/HTTPS
powershell -noprofile -noninteractive -Command 'Invoke-WebRequest -Uri "https://<URL>" -OutFile <FILE_PATH>'

# Alternative with WebClient
powershell -Command "(New-Object System.Net.WebClient).DownloadFile('https://<URL>','<FILE_PATH>')"
```

#### Upload File via HTTP POST
```powershell
# Upload file to web server via POST (server must be listening)
powershell -noprofile -noninteractive -command '[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}; $server="http://<URL>"; $filepath="<FILE_PATH>"; $http = new-object System.Net.WebClient; $response = $http.UploadFile($server,$filepath);'
```

#### Search for Files
```powershell
# Recursively find log files modified after specific date
Get-ChildItem -Path <FILE_PATH> -Force -Recurse -Filter *.log -ErrorAction SilentlyContinue | Where-Object {$_.LastWriteTime -gt "2012-08-20"}

# Find files containing password
Get-ChildItem -Path C:\ -Recurse -Include *.txt,*.doc,*.docx -ErrorAction SilentlyContinue | Select-String -Pattern "password"
```

### Data Export

#### Export to CSV
```powershell
# Export OS information to CSV
Get-WmiObject -Class win32_operatingsystem | Select-Object -Property * | Export-Csv <FILE_PATH>

# Export running services
Get-Service | Where-Object {$_.Status -eq "Running"} | Export-Csv running-services.csv
```

### Network Shares

#### Map Network Drive Persistently
```powershell
# Create persistent network drive mapping
New-PSDrive -Persist -PSProvider FileSystem -Root \\<IP_ADDRESS>\<SHARE_FOLDER> -Name I

# With credentials
$cred = Get-Credential
New-PSDrive -Name "Z" -PSProvider FileSystem -Root "\\<IP_ADDRESS>\<SHARE>" -Credential $cred -Persist
```

### Remote Management

#### Enable PowerShell Remoting
```powershell
# Turn on PowerShell remoting (requires admin)
Enable-PSRemoting -Force

# Allow all hosts (use with caution)
Set-Item WSMan:\localhost\Client\TrustedHosts -Value "*" -Force
```

---

## Batch Scripts

**Note**: When executing from a batch file, variables must be preceded with `%` (for a total of 2 `%`'s).

### Network Scanning

#### Nested For Loop Ping Sweep
```batch
for /L %i in (10,1,254) do @ (for /L %x in (10,1,254) do @ ping -n 1 -w 100 10.10.%i.%x 2>nul | find "Reply" && echo 10.10.%i.%x >> live.txt)
```

**Batch file version**:
```batch
for /L %%i in (10,1,254) do @ (for /L %%x in (10,1,254) do @ ping -n 1 -w 100 10.10.%%i.%%x 2>nul | find "Reply" && echo 10.10.%%i.%%x >> live.txt)
```

#### DNS Reverse Lookup
```batch
for /L %P in (2,1,254) do (nslookup 10.1.11.%P | findstr /i /c:"Name" >> dns.txt && echo HOST: 10.1.11.%P >> dns.txt)
```

### File Processing

#### Loop Through File Lines
```batch
for /F "tokens=*" %A in (<FILE_PATH>) do echo %A
```

**Batch file version**:
```batch
for /F "tokens=*" %%A in (<FILE_PATH>) do echo %%A
```

#### Search for Files
```batch
# Search for files beginning with "pass" and display details
forfiles /P <FILE_PATH> /s /m pass* -c "cmd /c echo @isdir @fdate @ftime @relpath @path @fsize"
```

**Variables**:
- `@isdir` - Is directory
- `@fdate` - File date
- `@ftime` - File time
- `@relpath` - Relative path
- `@path` - Full path
- `@fsize` - File size

### Authentication Testing

#### Domain Brute Force
```batch
# Test user/password combinations against domain
for /F %%N in (users.txt) do for /F %%P in (passwords.txt) do net use \\<IP_ADDRESS>\IPC$ /user:<DOMAIN>\%%N %%P 1>NUL 2>&1 && echo %%N:%%P && net use /delete \\<IP_ADDRESS>\IPC$ > NUL
```

#### Account Lockout Test
```batch
# lockout.bat - Test account lockout policy
@echo Test run:
for /F "tokens=*" %%A in (<FILE_PATH>) do net use \\<IP_ADDRESS>\c$ /USER:<DOMAIN>\%%A wrongpass
```

### Network Operations

#### DHCP Exhaustion
```batch
# Rapidly request DHCP addresses (network stress test)
for /L %P in (2,1,254) do (netsh interface ip set address name="<INTERFACE_NAME>" static 10.0.42.%P 255.255.255.0 <GATEWAY_IP> && ping 127.0.0.1 -n 1 -w 10000 > nul %1)
```

#### DNS Lookup Simulation
```batch
# Simulate DNS lookups for malicious domains (useful for AV/IDS testing)
# domains.txt should contain known malicious domains
for /F "tokens=*" %%A in (C:\Users\Administrator\Desktop\domains.txt) do nslookup %%A <DNS_SERVER_IP>
```

### System Operations

#### Simulated Web Browsing
```batch
# Generate web traffic for testing (browse to URLs 400 times)
for /L %P in (2,1,401) do @for %%U in (<URL1> <URL2> <URL3>) do start /b iexplore %%U & ping -n 6 localhost & taskkill /F /IM iexplore.exe
```

#### Rolling Reboot/Shutdown
```batch
# Rolling reboot across IP range
for /L %P in (2,1,254) do shutdown /r /m \\1.1.1.%P /f /t 0 /c "Reboot message"

# Rolling shutdown (replace /r with /s)
for /L %P in (2,1,254) do shutdown /s /m \\1.1.1.%P /f /t 0 /c "Shutdown message"
```

---

## Advanced PowerShell Techniques

### System Enumeration

```powershell
# Comprehensive system information
Get-ComputerInfo

# Installed software
Get-WmiObject -Class Win32_Product | Select-Object Name, Version

# Installed updates
Get-HotFix | Sort-Object InstalledOn -Descending

# Startup programs
Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location

# Scheduled tasks
Get-ScheduledTask | Where-Object {$_.State -eq "Ready"}

# Environment variables
Get-ChildItem Env:

# Logged on users
Get-WmiObject -Class Win32_ComputerSystem | Select-Object UserName
query user

# User accounts
Get-LocalUser
Get-WmiObject -Class Win32_UserAccount
```

### Process and Service Management

```powershell
# Get process with network connections
Get-Process | Where-Object {$_.Modules.ModuleName -contains "ws2_32.dll"}

# Process command line
Get-WmiObject Win32_Process | Select-Object ProcessId, Name, CommandLine

# Services with specific startup type
Get-Service | Where-Object {$_.StartType -eq "Automatic"}

# Service dependencies
Get-Service | Select-Object Name, @{Name="Dependencies";Expression={$_.ServicesDependedOn}}

# Kill all instances of a process
Get-Process -Name "notepad" | Stop-Process -Force
```

### Network Operations

```powershell
# Network adapters
Get-NetAdapter | Select-Object Name, Status, MacAddress, LinkSpeed

# IP configuration
Get-NetIPAddress | Select-Object InterfaceAlias, IPAddress, PrefixLength

# Routing table
Get-NetRoute | Format-Table

# DNS cache
Get-DnsClientCache

# Network statistics
Get-NetTCPConnection | Group-Object State
Get-NetUDPEndpoint

# Test port connectivity
Test-NetConnection -ComputerName <HOST> -Port <PORT>

# Trace route
Test-NetConnection -ComputerName <HOST> -TraceRoute
```

### Registry Operations

```powershell
# Read registry value
Get-ItemProperty -Path "HKLM:\Software\Microsoft\Windows NT\CurrentVersion" -Name ProductName

# Set registry value
Set-ItemProperty -Path "HKCU:\Software\MyApp" -Name "Setting" -Value "Value"

# Create registry key
New-Item -Path "HKCU:\Software\MyApp"

# Delete registry key
Remove-Item -Path "HKCU:\Software\MyApp" -Recurse

# List registry subkeys
Get-ChildItem -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall"

# Search registry
Get-ChildItem -Path HKLM:\Software -Recurse -ErrorAction SilentlyContinue | Get-ItemProperty | Where-Object {$_ -match "password"}
```

### Event Log Analysis

```powershell
# Recent security events
Get-EventLog -LogName Security -Newest 100

# Failed login attempts (Event ID 4625)
Get-EventLog -LogName Security | Where-Object {$_.EventID -eq 4625}

# Successful logins (Event ID 4624)
Get-EventLog -LogName Security | Where-Object {$_.EventID -eq 4624}

# Filter by time range
Get-EventLog -LogName System -After (Get-Date).AddDays(-1)

# Export to CSV
Get-EventLog -LogName System -Newest 1000 | Export-Csv events.csv

# Using Get-WinEvent (newer cmdlet)
Get-WinEvent -FilterHashtable @{LogName='Security';ID=4625}
```

### File and Directory Operations

```powershell
# Find large files
Get-ChildItem -Path C:\ -Recurse -ErrorAction SilentlyContinue | Where-Object {$_.Length -gt 100MB} | Sort-Object Length -Descending

# Find recently modified files
Get-ChildItem -Path C:\ -Recurse -ErrorAction SilentlyContinue | Where-Object {$_.LastWriteTime -gt (Get-Date).AddDays(-1)}

# Calculate directory size
Get-ChildItem -Path C:\Users -Recurse | Measure-Object -Property Length -Sum

# Find duplicate files by hash
Get-ChildItem -Recurse | Get-FileHash | Group-Object Hash | Where-Object {$_.Count -gt 1}

# Delete old files
Get-ChildItem -Path C:\Temp -Recurse | Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-30)} | Remove-Item -Force
```

### Remote Operations

```powershell
# Execute command on remote computer
Invoke-Command -ComputerName <COMPUTER> -ScriptBlock {Get-Process}

# Execute with credentials
$cred = Get-Credential
Invoke-Command -ComputerName <COMPUTER> -Credential $cred -ScriptBlock {Get-Service}

# Copy file to remote computer
Copy-Item -Path C:\local\file.txt -Destination \\<COMPUTER>\c$\remote\

# Enter remote session
Enter-PSSession -ComputerName <COMPUTER>

# Execute script on multiple computers
Invoke-Command -ComputerName Computer1,Computer2,Computer3 -FilePath C:\script.ps1

# Get results as job
Invoke-Command -ComputerName <COMPUTER> -ScriptBlock {Get-EventLog -LogName System} -AsJob
Get-Job | Receive-Job
```

### Data Manipulation

```powershell
# Convert to/from JSON
Get-Process | ConvertTo-Json | Out-File processes.json
Get-Content processes.json | ConvertFrom-Json

# Convert to/from XML
Get-Service | Export-Clixml services.xml
Import-Clixml services.xml

# Convert to/from CSV
Get-Process | Export-Csv processes.csv
Import-Csv processes.csv

# Parse text output
netstat -ano | Select-String "LISTENING" | ForEach-Object {$_.ToString().Trim() -split '\s+'}
```

---

## Security Considerations

### Authorization and Ethics

**CRITICAL WARNINGS**:

1. **Authorization Required**: Only execute these scripts on systems you own or have explicit written authorization to test
2. **Legal Compliance**: Unauthorized use may violate:
   - Computer Fraud and Abuse Act (CFAA)
   - Corporate security policies
   - Local and international laws

3. **Destructive Operations**: Scripts involving:
   - Rolling reboots/shutdowns
   - DHCP exhaustion
   - Account lockout testing
   - Brute force attempts

   Should ONLY be executed in isolated test environments with proper authorization.

### Safe Usage Guidelines

**DO**:
- Test scripts in isolated lab environments first
- Document all script executions
- Obtain written authorization before testing
- Use for legitimate system administration
- Follow principle of least privilege
- Implement proper error handling

**DON'T**:
- Run destructive scripts in production without approval
- Test authentication scripts against live systems
- Execute network scanning without authorization
- Use for malicious purposes
- Skip proper change management procedures
- Ignore security policies

### Audit and Logging

```powershell
# Enable PowerShell script block logging
Set-ItemProperty -Path "HKLM:\SOFTWARE\Wow6432Node\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging" -Name "EnableScriptBlockLogging" -Value 1

# Enable PowerShell transcription
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\Transcription" -Name "EnableTranscripting" -Value 1

# Start transcript manually
Start-Transcript -Path C:\Logs\PowerShell-Transcript.txt

# Stop transcript
Stop-Transcript
```

### Secure Credential Handling

```powershell
# Never hardcode passwords in scripts
# Use secure strings
$securePassword = Read-Host "Enter password" -AsSecureString
$credential = New-Object System.Management.Automation.PSCredential ("username", $securePassword)

# Store encrypted credentials
$credential | Export-Clixml -Path credential.xml

# Load encrypted credentials
$credential = Import-Clixml -Path credential.xml

# Use Windows Credential Manager
cmdkey /add:<TARGET> /user:<USERNAME> /pass:<PASSWORD>
```

### Best Practices

1. **Test First**: Always test scripts in non-production environments
2. **Version Control**: Store scripts in version control (Git)
3. **Code Review**: Have scripts reviewed before production use
4. **Error Handling**: Implement try/catch blocks and proper error handling
5. **Logging**: Log all script executions and results
6. **Documentation**: Document script purpose, parameters, and requirements
7. **Least Privilege**: Run with minimum required permissions
8. **Input Validation**: Validate all user input and parameters

### Example: Safe Script Template

```powershell
<#
.SYNOPSIS
    Brief description of script purpose
.DESCRIPTION
    Detailed description
.PARAMETER ComputerName
    Target computer name
.EXAMPLE
    .\script.ps1 -ComputerName SERVER01
.NOTES
    Author: Name
    Date: 2024-01-01
    Version: 1.0
    Requires: PowerShell 5.1+, Admin privileges
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [ValidateNotNullOrEmpty()]
    [string]$ComputerName
)

# Start transcript
$transcriptPath = "C:\Logs\Script-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
Start-Transcript -Path $transcriptPath

try {
    # Validate computer exists
    if (-not (Test-Connection -ComputerName $ComputerName -Quiet -Count 1)) {
        throw "Computer $ComputerName is not reachable"
    }

    # Main script logic here
    Write-Host "Processing $ComputerName..." -ForegroundColor Green

    # ... your code ...

    Write-Host "Script completed successfully" -ForegroundColor Green
}
catch {
    Write-Error "Script failed: $_"
    Write-Error $_.ScriptStackTrace
    exit 1
}
finally {
    # Cleanup
    Stop-Transcript
}
```

---

## Additional Resources

- [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)
- [PowerShell Gallery](https://www.powershellgallery.com/)
- [Batch Script Reference](https://ss64.com/nt/)
- [PowerShell Security Best Practices](https://docs.microsoft.com/en-us/powershell/scripting/security/security-considerations)

---

**Remember**: With great power comes great responsibility. Use these scripts ethically and legally.
