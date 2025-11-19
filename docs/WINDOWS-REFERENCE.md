# Windows Operating System Reference Guide

## Table of Contents

1. [Windows Versions](#windows-versions)
2. [Administrative Binaries](#administrative-binaries)
3. [Environment Variables](#environment-variables)
4. [Key Files & Locations](#key-files--locations)
5. [Registry Run Keys](#registry-run-keys)
6. [System Enumeration](#system-enumeration)
7. [Process & Service Enumeration](#process--service-enumeration)
8. [Network Information](#network-information)
9. [Registry Commands](#registry-commands)
10. [Remote System Enumeration](#remote-system-enumeration)
11. [Data Mining Windows](#data-mining-windows)
12. [Remote Execution](#remote-execution)

## Windows Versions

### Windows 10 & 11 Versions

| ID   | VERSION                  | DATE RELEASED |
| ---- | ------------------------ | ------------- |
| 1511 | Windows 10 – Threshold 2 | 2015-11-12    |
| 1607 | Windows 10 – Redstone 1  | 2016-08-02    |
| 1703 | Windows 10 – Redstone 2  | 2017-04-05    |
| 1709 | Windows 10 – Redstone 3  | 2017-10-17    |
| 1803 | Windows 10 – Redstone 4  | 2018-04-30    |
| 1809 | Windows 10 – Redstone 5  | 2018-11-13    |
| 1903 | Windows 10 – 19H1        | 2019-05-21    |
| 1909 | Windows 10 – Vanadium    | 2019-11-12    |
| 2004 | Windows 10 - Vibranium   | 2020-05-27    |
| 20H2 | Windows 10 - Vibranium   | 2020-10-20    |
| 21H1 | Windows 10 - Vibranium   | 2021-05-18    |
| 21H2 | Windows 10 - Vibranium   | 2021-11-16    |
| 21H2 | Windows 11 - Sun Valley  | 2021-10-05    |

**Note**: Windows 10 versions include Home, Pro, Education, Enterprise, Pro for Workstations, Pro Education, Windows 10 S, and Windows 10 Enterprise LTSC

### Windows Server Versions

| ID   | OS                  | DATE RELEASED |
| ---- | ------------------- | ------------- |
| 1607 | Windows Server 2016 | 2016-10-12    |
| 1709 | Windows Server      | 2017-10-17    |
| 1803 | Windows Server      | 2018-04-10    |
| 1809 | Windows Server 2019 | 2018-11-13    |
| 1903 | Windows Server      | 2019-11-12    |
| 1909 | Windows Server      | 2019-11-12    |
| 2004 | Windows Server      | 2020-06-26    |
| 20H2 | Windows Server      | 2020-10-20    |
| 21H2 | Windows Server 2022 | 2021-08-18    |

**Note**: Windows servers include Windows Server Essentials, Windows Server Standard, and Windows Server Datacenter.

### Windows "NT" Versions

| ID      | VERSION                                                                            |
| ------- | ---------------------------------------------------------------------------------- |
| NT 3.1  | Windows NT 3.1 (All)                                                               |
| NT 3.5  | Windows NT 3.5 (All)                                                               |
| NT 3.51 | Windows NT 3.51 (All)                                                              |
| NT 4.0  | Windows NT 4.0 (All)                                                               |
| NT 5.0  | Windows 2000 (All)                                                                 |
| NT 5.1  | Windows XP (Home, Pro, MC, Tablet PC, Starter, Embedded)                           |
| NT 5.2  | Windows XP (64-bit, Pro 64-bit)                                                    |
| NT 5.2  | Windows Server 2003 & R2 (Standard, Enterprise)                                    |
| NT 5.2  | Windows Home Server                                                                |
| NT 6.0  | Windows Vista (Starter, Home, Basic, Home Premium, Business, Enterprise, Ultimate) |
| NT 6.0  | Windows Server 2008 (Foundation, Standard, Enterprise)                             |
| NT 6.1  | Windows 7 (Starter, Home, Pro, Enterprise, Ultimate)                               |
| NT 6.1  | Windows Server 2008 R2 (Foundation, Standard, Enterprise)                          |
| NT 6.2  | Windows 8 (x86/64, Pro, Enterprise, Windows RT (ARM))                              |
| NT 6.2  | Windows Phone 8                                                                    |
| NT 6.2  | Windows Server 2012 (Foundation, Essentials, Standard)                             |
| NT 6.3  | Windows 8.1 (Pro, Enterprise)                                                      |
| NT 10   | Windows 10 version 1507                                                            |

## Administrative Binaries

| Binary         | Description                  |
| -------------- | ---------------------------- |
| `lusrmgr.msc`  | Local user and group manager |
| `services.msc` | Services control panel       |
| `taskmgr.exe`  | Task manager                 |
| `secpol.msc`   | Local security policy editor |
| `eventvwr.msc` | Event viewer                 |
| `regedit.exe`  | Registry editor              |
| `gpedit.msc`   | Group policy editor          |
| `control.exe`  | Control panel                |
| `ncpa.cpl`     | Network connections manager  |
| `devmgmt.msc`  | Device manager editor        |
| `diskmgmt.msc` | Disk manager editor          |

### Usage Examples

```powershell
# Open local user manager
lusrmgr.msc

# Open services
services.msc

# Open event viewer
eventvwr.msc

# Open registry editor
regedit.exe

# Open group policy editor
gpedit.msc

# Open device manager
devmgmt.msc

# Open disk management
diskmgmt.msc
```

## Environment Variables

| Variable            | Description                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `%SYSTEMROOT%`      | Points to Windows folder (Commonly: C:\Windows)                                                    |
| `%APPDATA%`         | Points to user roaming directory (Commonly: C:\Users\<USERNAME>\AppData\Roaming)                   |
| `%COMPUTERNAME%`    | The computer hostname                                                                              |
| `%HOMEDRIVE%`       | Points to default OS drive (Commonly: C:\)                                                         |
| `%HOMEPATH%`        | Points to user directory (Commonly: C:\Users\<USERNAME>)                                           |
| `%PATH%`            | When a command is run without a full path, the OS searches all file paths in PATH                  |
| `%PATHEXT%`         | When a command is run without an extension, the OS searches for file matches with these extensions |
| `%SYSTEMDRIVE%`     | Points to default OS drive (Commonly: C:\)                                                         |
| `%TMP%` / `%TEMP%`  | Points to user temp folders (Commonly: C:\Users\<USERNAME>\AppData\Local\Temp)                     |
| `%USERPROFILE%`     | Points to user directories (Commonly: C:\Users\<USERNAME>)                                         |
| `%WINDIR%`          | Points to Windows directory (Commonly: C:\Windows)                                                 |
| `%ALLUSERSPROFILE%` | Points to ProgramData (Commonly: C:\ProgramData on Windows 10+)                                    |

### PowerShell Examples

```powershell
# Display all environment variables
Get-ChildItem Env:

# Get specific variable
echo $env:SYSTEMROOT
echo $env:USERPROFILE

# Set environment variable
$env:MY_VAR = "value"

# Permanent environment variable (user level)
[Environment]::SetEnvironmentVariable("MY_VAR", "value", "User")

# Permanent environment variable (system level - requires admin)
[Environment]::SetEnvironmentVariable("MY_VAR", "value", "Machine")
```

## Key Files & Locations

| Path                                                                          | Description                          |
| ----------------------------------------------------------------------------- | ------------------------------------ |
| `%SYSTEMROOT%\System32\drivers\etc\hosts`                                     | DNS entries                          |
| `%SYSTEMROOT%\System32\drivers\etc\networks`                                  | Network settings                     |
| `%SYSTEMROOT%\System32\config\SAM`                                            | User & password hashes               |
| `%SYSTEMROOT%\repair\SAM`                                                     | Backup copy of SAM (WinXP)           |
| `%SYSTEMROOT%\System32\config\RegBack\SAM`                                    | Backup copy of SAM                   |
| `%WINDIR%\System32\config\AppEvent.Evt`                                       | Application Log (WinXP)              |
| `%WINDIR%\System32\config\SecEvent.Evt`                                       | Security Log (WinXP)                 |
| `%WINDIR%\System32\config\SECURITY`                                           | Security Log                         |
| `%WINDIR%\System32\config\APPLICATION`                                        | Application Log                      |
| `%ALLUSERSPROFILE%\Start Menu\Programs\Startup\`                              | Startup Location (WinXP)             |
| `%USERPROFILE%\Appdata\Roaming\Microsoft\Windows\Start Menu\Programs\Startup` | Startup Folder                       |
| `%WINDIR%\Panther\`                                                           | Commonly used unattend install files |
| `%WINDIR%\System32\Sysprep`                                                   | Commonly used unattend install files |
| `%WINDIR%\kb*`                                                                | Installed patches (WinXP)            |

**Note**: All file paths marked "(WinXP)" are Windows XP only. All others are tested and working with Windows 10+.

## Registry Run Keys

List of registry keys accessed during system boot (in load order):

### Boot-Time Keys

```
HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\BootExecute (WinXP)

HKLM\System\CurrentControlSet\Services
  Start value of 0 = Kernel Drivers (Load before Kernel initiation)
  Start value of 2 = Auto-Start
  Start value of 3 = Manual-Start

HKLM\Software\Microsoft\Windows\CurrentVersion\RunServicesOnce (WinXP)
HKCU\Software\Microsoft\Windows\CurrentVersion\RunServicesOnce (WinXP)
HKLM\Software\Microsoft\Windows\CurrentVersion\RunServices
HKCU\Software\Microsoft\Windows\CurrentVersion\RunServices (WinXP)
HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\Notify (WinXP)
HKLM\Software\Microsoft\Windows NT\CurrentVersion\Winlogon /v Userinit
HKLM\Software\Microsoft\Windows NT\CurrentVersion\Winlogon /v Shell
HKCU\Software\Microsoft\Windows NT\CurrentVersion\Winlogon /v Shell
HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\ShellServiceObjectDelayLoad
HKLM\Software\Microsoft\Windows\CurrentVersion\RunOnce
HKCU\Software\Microsoft\Windows\CurrentVersion\RunOnce
HKLM\Software\Microsoft\Windows\CurrentVersion\RunOnceEx (WinXP)
HKLM\Software\Microsoft\Windows\CurrentVersion\Run
HKCU\Software\Microsoft\Windows\CurrentVersion\Run
HKLM\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer\Run (WinXP)
HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer\Run (WinXP)
HKCU\Software\Microsoft\Windows NT\CurrentVersion\Windows\load (WinXP)
HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\SharedTaskScheduler (XP, NT, W2k only)
```

**Note**: Some of these keys are also reflected under `HKLM\Software\WOW6432Node` on 64-bit Windows systems.

**Tool Recommendation**: Windows Sysinternals Autoruns is an excellent utility to inspect and monitor auto-starting locations on Windows. Available at https://technet.microsoft.com/en-us/sysinternals/

## System Enumeration

### Operating System Information

```powershell
# Windows version
ver

# Display hotfixes and service packs
wmic qfe list

# Display whether 32 or 64 bit system
wmic cpu get datawidth /format:list

# Enumerate OS architecture - Presence of "Program Files (x86)" means 64bit
dir /a c:\

# Display OS configuration, including service pack levels
systeminfo

# Display drives
fsutil fsinfo drives

# Display logical drives
wmic logicaldisk get description,name

# Display environment variables
set

# Date of last reboot - Created date of pagefile.sys is last startup
dir /a c:\pagefile.sys

# Display shares
net share

# Display local sessions
net session

# List user mounted shares (MUST BE RUN IN CONTEXT OF USER)
reg query HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\MountPoints2\
```

### PowerShell System Information

```powershell
# Comprehensive system info
Get-ComputerInfo

# OS version details
Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber, OSArchitecture

# Installed updates
Get-HotFix | Sort-Object InstalledOn -Descending

# System uptime
(Get-CimInstance Win32_OperatingSystem).LastBootUpTime

# Display shares
Get-SmbShare

# Environment variables
Get-ChildItem Env:
```

## Process & Service Enumeration

```powershell
# Display services hosted in each process
tasklist /svc

# Display detailed information for running processes not running as SYSTEM
tasklist /FI "USERNAME ne NT AUTHORITY\SYSTEM" /FI "STATUS eq running" /V

# Force terminate process and child processes
taskkill /F /IM <PROCESS_NAME> /T

# Terminate specific PID
taskkill /F /PID <PID> /T

# Terminate all instances of a process (WMIC)
wmic process where name="<PROCESS_NAME>" call terminate

# Display executable path and PID of all running processes
wmic process get name,executablepath,processid

# Display Anti-Virus products (PowerShell)
Get-WmiObject -Namespace "root\SecurityCenter2" -Class AntiVirusProduct -ErrorAction Stop

# Run file as specific user (prompts for password)
runas /user:<DOMAIN>\<USERNAME> "<FILE_PATH> [ARGS]"

# Display processes matching string
tasklist /v | findstr "<STRING_TO_SEARCH>"

# Display processes with command line arguments
wmic process get processid,commandline

# Display all services
sc query state= all

# Query specific service
sc query <SERVICE_NAME>

# Start/Stop service
sc start <SERVICE_NAME>
sc stop <SERVICE_NAME>
```

### PowerShell Process & Service Enumeration

```powershell
# Get all processes
Get-Process

# Get process by name
Get-Process -Name <PROCESS_NAME>

# Get detailed process info
Get-Process | Select-Object Name, Id, CPU, WorkingSet, Path

# Kill process
Stop-Process -Name <PROCESS_NAME>
Stop-Process -Id <PID>

# Get services
Get-Service

# Start/Stop service
Start-Service -Name <SERVICE_NAME>
Stop-Service -Name <SERVICE_NAME>

# Get service details
Get-Service | Select-Object Name, Status, StartType, DisplayName

# Get processes not running as SYSTEM
Get-Process | Where-Object {$_.StartInfo.UserName -ne "NT AUTHORITY\SYSTEM"}

# Get listening ports with process
Get-NetTCPConnection | Where-Object {$_.State -eq "Listen"} | Select-Object LocalAddress, LocalPort, OwningProcess
```

## Network Information

```powershell
# Network interface information
ipconfig /all

# Display local DNS cache
ipconfig /displaydns

# Flush DNS cache
ipconfig /flushdns

# Display all connections and ports with process ID
netstat -ano

# Display only listening ports
netstat -an | findstr LISTENING

# Write netstat output to file every 3 seconds
netstat -anop tcp 3 >> <FILE_PATH>

# Display routing table
route print

# Display ARP table
arp -a

# Attempt DNS zone transfer
nslookup
server <FQDN>
set type=ANY
ls -d <DOMAIN> > <FILEPATH>
exit

# Domain SRV lookup (ldap, kerberos, sip)
nslookup -type=SRV _www._tcp.<URL>

# Disable firewall (Old method)
netsh firewall set opmode disable

# Display saved wireless profiles
netsh wlan show profiles

# Export wireless profiles with plaintext keys
netsh wlan export profile folder=. key=clear

# List interface IDs/MTUs
netsh interface ip show interfaces

# Set static IP
netsh interface ip set address name="<INTERFACE_NAME>" static <NEW_IP> <NEW_SUBNET_MASK> <NEW_GATEWAY>

# Set DNS server
netsh interface ip set dnsservers name="<INTERFACE_NAME>" static <DNS_SERVER_IP>

# Set interface to use DHCP
netsh interface ip set address name="<INTERFACE_NAME>" source=dhcp
```

### PowerShell Network Commands

```powershell
# Get network adapters
Get-NetAdapter

# Get IP configuration
Get-NetIPConfiguration

# Get IP addresses
Get-NetIPAddress

# Get routing table
Get-NetRoute

# Get listening ports
Get-NetTCPConnection | Where-Object {$_.State -eq "Listen"}

# Test connection
Test-NetConnection -ComputerName <HOST> -Port <PORT>

# Get firewall rules
Get-NetFirewallRule | Where-Object {$_.Enabled -eq 'True'}

# Create firewall rule
New-NetFirewallRule -DisplayName "Allow HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# Get DNS client cache
Get-DnsClientCache

# Clear DNS cache
Clear-DnsClientCache

# Get wireless profiles
netsh wlan show profiles

# Display network statistics
Get-NetAdapterStatistics
```

## Registry Commands

```powershell
# Search registry for password
reg query HKLM /f password /t REG_SZ /s

# Save security hive to file (Requires SYSTEM privileges)
reg save HKLM\Security security.hive

# Query specific registry key
reg query "HKLM\Software\Microsoft\Windows NT\CurrentVersion" /v ProductName

# Add registry key
reg add HKCU\Software\MyApp /v MyValue /t REG_SZ /d "MyData"

# Delete registry key
reg delete HKCU\Software\MyApp /v MyValue /f

# Export registry key
reg export HKCU\Software\MyApp myapp.reg

# Import registry file
reg import myapp.reg
```

### Important Registry Keys

```
# OS information
HKLM\Software\Microsoft\Windows NT\CurrentVersion
  /v ProductName
  /v InstallDate
  /v RegisteredOwner
  /v SystemRoot

# Time zone (offset in minutes from UTC)
HKLM\System\CurrentControlSet\Control\TimeZoneInformation
  /v ActiveTimeBias

# Mapped network drives
HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Map Network Drive MRU

# Mounted devices
HKLM\System\MountedDevices

# USB devices
HKLM\System\CurrentControlSet\Enum\USB

# Audit policy (Requires SYSTEM privileges)
HKLM\Security\Policy\PolAdTev

# Kernel/user services
HKLM\SYSTEM\CurrentControlSet\Services

# Installed software (all users)
HKLM\Software

# Installed software (current user)
HKCU\Software

# Recent WordPad documents
HKCU\Software\Microsoft\Windows\CurrentVersion\Applets\Wordpad\Recent File List

# Recent Run dialog entries
HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\RunMRU

# Typed URLs
HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\TypedURLs

# Last registry key accessed
HKCU\Software\Microsoft\Windows\CurrentVersion\Applets\Regedit /v LastKey

# Saved PuTTY SSH sessions
HKCU\Software\SimonTatham\Putty\Sessions
```

### PowerShell Registry Commands

```powershell
# Get registry value
Get-ItemProperty -Path "HKLM:\Software\Microsoft\Windows NT\CurrentVersion" -Name ProductName

# Set registry value
Set-ItemProperty -Path "HKCU:\Software\MyApp" -Name "MyValue" -Value "MyData"

# Create registry key
New-Item -Path "HKCU:\Software\MyApp"

# Remove registry key
Remove-Item -Path "HKCU:\Software\MyApp" -Recurse

# Search registry for string
Get-ChildItem -Path HKLM:\Software -Recurse | Get-ItemProperty | Where-Object {$_ -match "password"}
```

## Remote System Enumeration

```powershell
# Display sessions for remote system
net session \\<IP_ADDRESS>

# Display logged in user on remote machine
wmic /node:<IP_ADDRESS> computersystem get username

# Execute file on remote system with credentials
wmic /node:<IP_ADDRESS> /user:<DOMAIN>\<USERNAME> /password:<PASSWORD> process call create "\\<IP_ADDRESS>\<SHARE_FOLDER>\<FILE_PATH>"

# Display process listing every second for remote machine
wmic /node:<IP_ADDRESS> process list brief /every:1

# Query remote registry
reg query \\<IP_ADDRESS>\<REG_HIVE>\<REG_KEY> /v <REG_VALUE>

# Display process listing on remote system
tasklist /S <IP_ADDRESS> /v

# Display system information for remote system
systeminfo /S <IP_ADDRESS> /U <DOMAIN>\<USERNAME> /P <PASSWORD>

# Display shares of remote computer
net view \\<IP_ADDRESS> /all

# Connect to remote filesystem with specified user
net use * \\<IP_ADDRESS>\<SHARE_FOLDER> /user:<DOMAIN>\<USERNAME> <PASSWORD>

# Add registry key to remote system
REG ADD "\\<IP_ADDRESS>\HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "My App" /t REG_SZ /F /D "<FILE_PATH>"

# Copy remote folder
xcopy /s \\<IP_ADDRESS>\<SHARE_FOLDER> <LOCAL_DIR>

# Display system uptime (look for creation date of pagefile.sys)
dir \\<IP_ADDRESS>\c$\pagefile.sys

# Display processes (look for AV, logged on users, etc.)
tasklist /v /s <IP_ADDRESS>

# Display system architecture
dir \\<IP_ADDRESS>\c$
```

### PowerShell Remote Commands

```powershell
# Enable PowerShell Remoting
Enable-PSRemoting -Force

# Test WinRM connectivity
Test-WSMan -ComputerName <COMPUTER_NAME>

# Enter interactive session
Enter-PSSession -ComputerName <COMPUTER_NAME>

# Run command on remote computer
Invoke-Command -ComputerName <COMPUTER_NAME> -ScriptBlock {Get-Process}

# Run command with credentials
$cred = Get-Credential
Invoke-Command -ComputerName <COMPUTER_NAME> -Credential $cred -ScriptBlock {Get-Service}

# Run script on remote computer
Invoke-Command -ComputerName <COMPUTER_NAME> -FilePath C:\script.ps1

# Copy file to remote computer
Copy-Item -Path C:\local\file.txt -Destination \\<COMPUTER_NAME>\c$\remote\

# Get remote system info
Get-CimInstance -ClassName Win32_OperatingSystem -ComputerName <COMPUTER_NAME>

# Get remote services
Get-Service -ComputerName <COMPUTER_NAME>
```

## Data Mining Windows

### File Information & Searching

```powershell
# Search for all PDFs
dir /a /s /b C:\*.pdf

# Search for case-insensitive string in .txt files
findstr /SI password *.txt

# Display file contents
type <FILE_PATH>

# Display all lines in file that match string
find /I "<STRING_TO_SEARCH>" <FILE_PATH>

# Display line count for file
type <FILE_PATH> | find /c /v ""

# Enumerate recently opened files
dir C:\Users\<USERNAME>\AppData\Roaming\Microsoft\Windows\Recent
# Then examine .lnk files:
type <FILE_PATH>
```

### PowerShell File Searching

```powershell
# Search for files
Get-ChildItem -Path C:\ -Filter *.pdf -Recurse -ErrorAction SilentlyContinue

# Search file contents
Get-ChildItem -Path C:\ -Filter *.txt -Recurse | Select-String -Pattern "password"

# Find large files
Get-ChildItem -Path C:\ -Recurse | Where-Object {$_.Length -gt 100MB} | Sort-Object Length -Descending

# Find files modified in last 24 hours
Get-ChildItem -Path C:\ -Recurse | Where-Object {$_.LastWriteTime -gt (Get-Date).AddDays(-1)}

# Get file hash
Get-FileHash -Path <FILE_PATH> -Algorithm SHA256
```

### Tree Filesystem to Searchable File

Three options to enumerate filesystem to file, compress, download, and extract for analysis:

**Option 1: tree.com**

```powershell
tree.com /F /A \\<IP_ADDRESS>\<FILE_PATH> > c:\windows\temp\silverlight1.log
```

**Option 2: dir /s**

```powershell
dir /s /a \\<IP_ADDRESS>\<FILE_PATH> > c:\windows\temp\silverlight1.log
```

**Option 3: forfiles** (Does not work with UNC paths)

```powershell
forfiles /S /C "cmd /c echo @path" /p <FILE_PATH> > c:\windows\temp\silverlight1.log
```

**Compress and extract:**

```powershell
# Compress file
makecab c:\windows\temp\silverlight1.log c:\windows\temp\silverlight_compressed.zip

# Download from target and extract
expand c:\users\administrator\desktop\silverlight_compressed.zip c:\users\administrator\desktop\extractedFile.txt
```

### Using Volume Shadow Service (VSS)

```powershell
# Enumerate saved volume shadow files
vssadmin list shadows

# Create shadow file of C:\ (if none exist)
wmic shadowcopy call create Volume=c:\

# Enumerate shadows again (note the \\?\GLOBALROOT location)
vssadmin list shadows

# Create OS link to shadow file (Note trailing backslash!)
mklink /D C:\restore \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy6\

# Copy, exfil, or interact with shadow files
# ... perform operations on C:\restore\

# Remove link (DO NOT use "del" - it will remove actual files!)
rmdir c:\restore
```

## Remote Execution

### SC.EXE Remote Execution

Upload binary to remote machine, modify existing service to point at binary, start service, and reconfigure back.

```powershell
# Ensure service runs as LocalSystem and note original binary path
sc \\<IP_ADDRESS> qc vss

# Ensure service is currently off
sc \\<IP_ADDRESS> query vss

# Set remote service binpath to uploaded binary
sc \\<IP_ADDRESS> config vss binpath="<FILE_PATH>"

# Verify binpath was set correctly
sc \\<IP_ADDRESS> qc vss

# Start service on remote machine
sc \\<IP_ADDRESS> start vss

# Stop service before resetting binpath
sc \\<IP_ADDRESS> stop vss

# Set service binpath back to original
sc \\<IP_ADDRESS> config vss binpath="<ORIGINAL_FILE_PATH>"

# Verify binpath was reset correctly
sc \\<IP_ADDRESS> qc vss
```

**Service Requirements:**

- Must run as LocalSystem
- Must be stoppable
- Must be configurable

### MMC COM Object Execution

Upload binary to remote machine system folder and execute via MMC COM execution.

**Note**: Only works against Windows Server targets.

```powershell
powershell -ep bypass -nop -Command "([activator]::CreateInstance([type]::GetTypeFromProgID('MMC20.Application','<IP_ADDRESS>'))).Document.ActiveView.ExecuteShellCommand('<FILE_PATH>',$null,$null,'7')"
```

### Remote Scheduled Tasks Execution

Upload binary, create scheduled task, run task, and delete task.

```powershell
# Add task
schtasks /Create /F /RU system /SC ONLOGON /TN OfficeUpdater /TR <FILE_PATH> /s <IP_ADDRESS>

# Query task verbose
schtasks /query /tn OfficeUpdater /fo list /v /s <IP_ADDRESS>

# Run task
schtasks /run /tn OfficeUpdater /s <IP_ADDRESS>

# Delete task
schtasks /delete /tn OfficeUpdater /f /s <IP_ADDRESS>
```

### PowerShell Remoting Execution

```powershell
# Execute command on remote system
Invoke-Command -ComputerName <COMPUTER_NAME> -ScriptBlock {whoami}

# Execute with credentials
$cred = Get-Credential
Invoke-Command -ComputerName <COMPUTER_NAME> -Credential $cred -ScriptBlock {Get-Process}

# Execute script file
Invoke-Command -ComputerName <COMPUTER_NAME> -FilePath C:\script.ps1

# Background job
Invoke-Command -ComputerName <COMPUTER_NAME> -ScriptBlock {Get-EventLog -LogName System} -AsJob

# Get job results
Get-Job | Receive-Job
```

### WMI Remote Execution

```powershell
# Execute process remotely
wmic /node:<IP_ADDRESS> /user:<USERNAME> /password:<PASSWORD> process call create "cmd.exe /c <COMMAND>"

# Execute with current credentials
wmic /node:<IP_ADDRESS> process call create "powershell.exe -File \\<IP_ADDRESS>\share\script.ps1"

# PowerShell WMI
Invoke-WmiMethod -ComputerName <COMPUTER_NAME> -Class Win32_Process -Name Create -ArgumentList "powershell.exe -Command Get-Process"
```

## Security Considerations

**WARNING**: Many of the commands in this reference are powerful system-level operations that should only be used:

- On systems you own or have explicit authorization to access
- For legitimate system administration purposes
- For authorized security testing and penetration testing
- In compliance with organizational policies and legal requirements

**Unauthorized use of these commands may violate:**

- Computer Fraud and Abuse Act (CFAA)
- Corporate security policies
- Local and international laws

Always ensure proper authorization before using administrative or remote execution commands.

## Additional Resources

- [Microsoft Documentation](https://docs.microsoft.com/)
- [Windows Sysinternals](https://docs.microsoft.com/en-us/sysinternals/)
- [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)
- [Windows Security Documentation](https://docs.microsoft.com/en-us/windows/security/)
