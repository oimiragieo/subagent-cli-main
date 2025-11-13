# macOS Reference Guide

## Table of Contents
1. [macOS Versions](#macos-versions)
2. [File System Structure](#file-system-structure)
3. [System Enumeration](#system-enumeration)
4. [User Management](#user-management)
5. [Group Management](#group-management)
6. [Network Configuration](#network-configuration)
7. [Package Management](#package-management)
8. [Security Features](#security-features)
9. [Persistence Mechanisms](#persistence-mechanisms)

---

## macOS Versions

### Version History

| ID | VERSION | DATE RELEASED |
|---|---|---|
| 10.0.4 | Mac OS X Cheetah | 2001-03-24 |
| 10.1.5 | Mac OS X Puma | 2001-09-25 |
| 10.2.8 | Mac OS X Jaguar | 2002-08-23 |
| 10.3.9 | Mac OS X Panther | 2003-10-24 |
| 10.4.11 | Mac OS X Tiger | 2005-04-29 |
| 10.5.8 | Mac OS X Leopard | 2007-10-26 |
| 10.6.8 | Mac OS X Snow Leopard | 2009-08-28 |
| 10.7.5 | OS X Lion | 2011-07-20 |
| 10.8.5 | OS X Mountain Lion | 2012-07-25 |
| 10.9.5 | OS X Mavericks | 2013-10-22 |
| 10.10.5 | OS X Yosemite | 2014-10-16 |
| 10.11.6 | OS X El Capitan | 2015-09-30 |
| 10.12.6 | macOS Sierra | 2016-09-20 |
| 10.13.6 | macOS High Sierra | 2017-09-25 |
| 10.14.6 | macOS Mojave | 2018-09-24 |
| 10.15.7 | macOS Catalina | 2019-10-07 |
| 11.6.7 | macOS Big Sur | 2020-11-12 |
| 12.4 | macOS Monterey | 2021-10-25 |

**Note**: macOS Ventura (13.x) and Sonoma (14.x) released after 2022.

---

## File System Structure

| Path | Description |
|---|---|
| `/Applications` | Contains applications (Mail, Calendar, Safari, etc.) |
| `/bin` | User binaries |
| `/dev` | Interface for system devices |
| `/cores` | Hidden binary files containing pieces of computer memory (for debugging) |
| `/etc` | System configuration files |
| `/Users` | Base directory for user files |
| `/Library` | Critical software libraries |
| `/home` | Not used for anything |
| `/private` | Stores essential system files and caches |
| `/opt` | Third party software |
| `/sbin` | System administrator binaries |
| `/System` | Contains operating system files |
| `/tmp` | Temporary files |
| `/usr` | Less critical files |
| `/Volumes` | Shows mounted volumes |
| `/var` | Variable system files |

### Important Directories

```bash
# Applications
/Applications                          # User-installed applications
/Applications/Utilities                # System utilities
/System/Applications                   # System applications

# User files
/Users/<USERNAME>                      # User home directory
/Users/<USERNAME>/Library              # User-specific libraries
/Users/<USERNAME>/Desktop              # User desktop
/Users/<USERNAME>/Documents            # User documents
/Users/<USERNAME>/Downloads            # User downloads

# System configuration
/etc                                   # System configuration files
/private/etc                          # Additional system configs
/Library/LaunchDaemons                # System-wide daemons
/Library/LaunchAgents                 # System-wide agents
/Users/<USERNAME>/Library/LaunchAgents # User-specific agents

# Logs
/var/log                              # System logs
/Library/Logs                         # Application logs
/Users/<USERNAME>/Library/Logs        # User application logs
```

---

## System Enumeration

### Basic System Information

```bash
# Display applications
ls /Applications

# Display computer name
hostname

# Current username
id
whoami

# List logged on users
w
who

# List previous user log in sessions
last

# Disk usage
df -h

# Kernel version & CPU information
uname -a
uname -m                              # Architecture
uname -r                              # Kernel version

# Display mounted drives
mount
diskutil list

# Display OS version information
sw_vers
system_profiler SPSoftwareDataType

# Display shell type
echo $0
echo $SHELL

# Enumerate user home directories
ls /Users
ls -la /Users

# Network and IP information
ifconfig -a
networksetup -listallnetworkservices

# Process enumeration
ps -ef
ps aux

# Kill process by PID
kill -9 <PID>

# Find specific process
ps -ef | grep -ia <STRING_TO_SEARCH>

# Check for active TCP network connections
netstat -p tcp -van

# System uptime
uptime

# Hardware information
system_profiler SPHardwareDataType

# Storage information
diskutil info disk0
```

### Advanced System Profiling

```bash
# Display all system information
system_profiler

# Specific data types
system_profiler SPSoftwareDataType    # Software info
system_profiler SPHardwareDataType    # Hardware info
system_profiler SPMemoryDataType      # Memory info
system_profiler SPStorageDataType     # Storage info
system_profiler SPNetworkDataType     # Network info
system_profiler SPBluetoothDataType   # Bluetooth info
system_profiler SPUSBDataType         # USB devices
system_profiler SPFirewallDataType    # Firewall info

# Export to file
system_profiler > system_info.txt
```

### PATH Variable Modification

```bash
# Display current PATH
echo $PATH

# Add to PATH temporarily
export PATH=$PATH:/new/path

# Add permanently (edit profile)
sudo nano /etc/paths

# Or add to user profile
echo 'export PATH=$PATH:/new/path' >> ~/.bash_profile
echo 'export PATH=$PATH:/new/path' >> ~/.zshrc  # For zsh
```

---

## User Management

### User Property List (plist) Files

**IMPORTANT**: macOS stores user information (including password hashes) in property list files (.plist), NOT in /etc/shadow like Linux.

#### User plist File Enumeration

```bash
# Enumerate user plist information (requires sudo)
sudo plutil -p /var/db/dslocal/nodes/Default/users/<USERNAME>.plist

# Enumerate user password hash
sudo dscl . read Users/<USERNAME> ShadowHashData

# View user plist in XML format
sudo plutil -convert xml1 /var/db/dslocal/nodes/Default/users/<USERNAME>.plist -o -
```

### User Enumeration

```bash
# Display all user and daemon accounts
dscl . list /Users

# Display actual user accounts (no daemon accounts)
dscl . list /Users | grep -v '_'

# Display verbose user information (shell, gid, uid, full name)
dscacheutil -q user

# Display very verbose user information (includes hash)
dscl . -read /Users/<USERNAME>

# Enumerate specific user's group assignments
dscacheutil -q group -a name <GROUP_NAME>

# List all users with UID
dscl . list /Users UniqueID

# Check user shell
dscl . -read /Users/<USERNAME> UserShell

# Check user home directory
dscl . -read /Users/<USERNAME> NFSHomeDirectory
```

### Create User and Make Administrator

```bash
# Step 1: Create user
sudo dscl . -create /Users/<USERNAME>

# Step 2: Set shell preferences
sudo dscl . -create /Users/<USERNAME> UserShell /bin/bash
# Or for zsh
sudo dscl . -create /Users/<USERNAME> UserShell /bin/zsh

# Step 3: Set user full name
sudo dscl . -create /Users/<USERNAME> RealName "<USER_FULL_NAME>"

# Step 4: List existing IDs and select unused ID
dscl . list /Users UniqueID

# Step 5: Set unique ID for user (use unused ID from step 4)
sudo dscl . -create /Users/<USERNAME> UniqueID "<NEWLY_SELECTED_ID>"

# Step 6: Set primary group ID (20 is standard for staff)
sudo dscl . -create /Users/<USERNAME> PrimaryGroupID 20

# Step 7: Set home directory
sudo dscl . -create /Users/<USERNAME> NFSHomeDirectory /Users/<USERNAME>

# Step 8: Create home directory
sudo mkdir /Users/<USERNAME>
sudo chown <USERNAME>:staff /Users/<USERNAME>

# Step 9: Set user password
sudo dscl . -passwd /Users/<USERNAME> <NEW_PASSWORD>

# Step 10: Add user to admin group (makes them administrator)
sudo dscl . -append /Groups/admin GroupMembership <USERNAME>

# Verify user creation
dscl . -read /Users/<USERNAME>
```

### User Modification

```bash
# Change user password
sudo dscl . -passwd /Users/<USERNAME> <NEW_PASSWORD>

# Change user shell
sudo dscl . -create /Users/<USERNAME> UserShell /bin/zsh

# Change user full name
sudo dscl . -create /Users/<USERNAME> RealName "New Full Name"

# Lock user account (change shell to /usr/bin/false)
sudo dscl . -create /Users/<USERNAME> UserShell /usr/bin/false

# Enable user account (restore shell)
sudo dscl . -create /Users/<USERNAME> UserShell /bin/bash
```

### Delete User

```bash
# Delete user account
sudo dscl . -delete /Users/<USERNAME>

# Remove home directory
sudo rm -rf /Users/<USERNAME>

# Remove from groups
sudo dscl . -delete /Groups/admin GroupMembership <USERNAME>
```

---

## Group Management

### Create Group

```bash
# Step 1: Create group
sudo dscl . -create /Groups/<GROUPNAME>

# Step 2: Add longform name
sudo dscl . -create /Groups/<GROUPNAME> RealName "Service and Support"

# Step 3: Initialize group password
sudo dscl . -create /Groups/<GROUPNAME> passwd "*"

# Step 4: Find unused group ID
dscl . list /Groups PrimaryGroupID | tr -s ' ' | sort -n -t ' ' -k2,2

# Step 5: Assign group ID
sudo dscl . -create /Groups/<GROUPNAME> gid <NEWLY_SELECTED_ID>

# Step 6: Assign users to group (this overwrites with ONE user)
sudo dscl . -create /Groups/<GROUPNAME> GroupMembership <USERNAME>
```

### Group Enumeration

```bash
# Enumerate all groups
dscl . list /Groups

# Enumerate all groups and their members
dscacheutil -q group

# List specific group members
dscl . -read /Groups/<GROUPNAME>
dscl . -read /Groups/<GROUPNAME> GroupMembership

# Check user's group memberships
groups <USERNAME>
id <USERNAME>
```

### Group Modification

```bash
# Append user to group (does not overwrite)
sudo dscl . -append /Groups/<GROUPNAME> GroupMembership <USERNAME>

# Remove user from group
sudo dscl . -delete /Groups/<GROUPNAME> GroupMembership <USERNAME>

# Delete group
sudo dscl . -delete /Groups/<GROUPNAME>
```

### Common Groups

| Group | Purpose |
|---|---|
| `admin` | Administrator privileges |
| `staff` | Standard users |
| `wheel` | Root access via sudo |
| `everyone` | All users |
| `guest` | Guest account access |

---

## Network Configuration

### Network Information

```bash
# Network interfaces
ifconfig
ifconfig -a                           # All interfaces

# Specific interface
ifconfig en0

# Network services
networksetup -listallnetworkservices

# Get info for specific service
networksetup -getinfo Wi-Fi
networksetup -getinfo Ethernet

# DNS servers
networksetup -getdnsservers Wi-Fi
scutil --dns

# Network locations
networksetup -listlocations

# Active network connections
netstat -an
lsof -i
```

### Network Configuration

```bash
# Set IP address (DHCP)
sudo networksetup -setdhcp Wi-Fi

# Set static IP
sudo networksetup -setmanual Wi-Fi <IP> <SUBNET> <ROUTER>
# Example:
sudo networksetup -setmanual Wi-Fi 192.168.1.100 255.255.255.0 192.168.1.1

# Set DNS servers
sudo networksetup -setdnsservers Wi-Fi 8.8.8.8 8.8.4.4

# Set search domains
sudo networksetup -setsearchdomains Wi-Fi example.com

# Renew DHCP lease
sudo ipconfig set en0 DHCP

# Flush DNS cache
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### Wi-Fi Management

```bash
# Turn Wi-Fi on/off
networksetup -setairportpower en0 on
networksetup -setairportpower en0 off

# List available Wi-Fi networks
/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s

# Connect to Wi-Fi network
networksetup -setairportnetwork en0 <SSID> <PASSWORD>

# Show current Wi-Fi network
networksetup -getairportnetwork en0

# Disconnect from Wi-Fi
sudo /System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -z
```

### Firewall Management

```bash
# Check firewall status
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Enable/disable firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off

# List applications
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --listapps

# Add application to firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /Applications/App.app

# Block application
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --blockapp /Applications/App.app

# Enable stealth mode
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setstealthmode on
```

---

## Package Management

### Homebrew

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install package
brew install <package>

# Install cask (GUI applications)
brew install --cask <application>

# Update Homebrew
brew update

# Upgrade all packages
brew upgrade

# Upgrade specific package
brew upgrade <package>

# List installed packages
brew list

# Search for package
brew search <package>

# Uninstall package
brew uninstall <package>

# Cleanup old versions
brew cleanup

# Show package information
brew info <package>

# List outdated packages
brew outdated

# Pin package version
brew pin <package>
brew unpin <package>
```

### MacPorts

```bash
# Update port list
sudo port selfupdate

# Search for port
port search <package>

# Install port
sudo port install <package>

# Uninstall port
sudo port uninstall <package>

# List installed ports
port installed

# Upgrade all ports
sudo port upgrade outdated

# Clean up
sudo port clean --all <package>
```

---

## Security Features

### System Integrity Protection (SIP)

```bash
# Check SIP status
csrutil status

# Disable SIP (must be done from Recovery Mode)
# 1. Reboot into Recovery Mode (Cmd+R during boot)
# 2. Open Terminal from Utilities menu
# 3. Run:
csrutil disable
# 4. Reboot

# Enable SIP (from Recovery Mode)
csrutil enable
```

### Gatekeeper

```bash
# Check Gatekeeper status
spctl --status

# Enable/Disable Gatekeeper
sudo spctl --master-enable
sudo spctl --master-disable

# Allow app from anywhere (for one app)
sudo spctl --add /Applications/App.app
sudo xattr -r -d com.apple.quarantine /Applications/App.app

# Check app signature
spctl --assess --verbose /Applications/App.app
```

### FileVault (Disk Encryption)

```bash
# Check FileVault status
fdesetup status

# Enable FileVault (interactive)
sudo fdesetup enable

# List FileVault users
sudo fdesetup list

# Add user to FileVault
sudo fdesetup add -usertoadd <USERNAME>
```

### Keychain Management

```bash
# List keychains
security list-keychains

# Find certificate
security find-certificate -a -p

# Find generic password
security find-generic-password -s <service-name>

# Add generic password
security add-generic-password -a <account> -s <service> -w <password>

# Delete password
security delete-generic-password -s <service>

# Import certificate
security import cert.p12 -k ~/Library/Keychains/login.keychain

# Unlock keychain
security unlock-keychain ~/Library/Keychains/login.keychain
```

---

## Persistence Mechanisms

### LaunchDaemons and LaunchAgents

**LaunchDaemons** run as root at system startup.
**LaunchAgents** run as user at login.

#### Create LaunchDaemon

```bash
# Create plist file
sudo nano /Library/LaunchDaemons/com.example.daemon.plist
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.example.daemon</string>
    <key>ProgramArguments</key>
    <array>
        <string>/path/to/script.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

```bash
# Set permissions
sudo chown root:wheel /Library/LaunchDaemons/com.example.daemon.plist
sudo chmod 644 /Library/LaunchDaemons/com.example.daemon.plist

# Load daemon
sudo launchctl load /Library/LaunchDaemons/com.example.daemon.plist

# Unload daemon
sudo launchctl unload /Library/LaunchDaemons/com.example.daemon.plist

# List loaded daemons
sudo launchctl list
```

#### Create LaunchAgent

```bash
# Create user-specific launch agent
nano ~/Library/LaunchAgents/com.example.agent.plist

# Or system-wide
sudo nano /Library/LaunchAgents/com.example.agent.plist
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.example.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/path/to/script.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
```

```bash
# Load agent
launchctl load ~/Library/LaunchAgents/com.example.agent.plist

# Unload agent
launchctl unload ~/Library/LaunchAgents/com.example.agent.plist
```

### Login Items

```bash
# Add login item (GUI method via System Preferences)
# System Preferences > Users & Groups > Login Items

# Add via command line (osascript)
osascript -e 'tell application "System Events" to make login item at end with properties {path:"/Applications/App.app", hidden:false}'

# List login items
osascript -e 'tell application "System Events" to get the name of every login item'

# Remove login item
osascript -e 'tell application "System Events" to delete login item "ItemName"'
```

### Cron Jobs

```bash
# Edit crontab
crontab -e

# List crontab
crontab -l

# Remove crontab
crontab -r

# Example: Run script every day at 2 AM
0 2 * * * /path/to/script.sh

# Example: Run script every hour
0 * * * * /path/to/script.sh

# Example: Run script at boot
@reboot /path/to/script.sh
```

---

## Additional Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [macOS Security Guide](https://support.apple.com/guide/security/welcome/web)
- [Homebrew Documentation](https://docs.brew.sh/)
- [launchd Info](https://www.launchd.info/)

---

## Security Considerations

**WARNING**: Many commands in this reference require administrative privileges and should only be used:
- On systems you own or have explicit authorization to access
- For legitimate system administration purposes
- For authorized security testing
- In compliance with organizational policies

**Unauthorized use may violate**:
- Computer Fraud and Abuse Act (CFAA)
- Corporate security policies
- Local and international laws

Always ensure proper authorization before using administrative commands, especially those involving:
- User account manipulation
- Password hash extraction
- Network configuration changes
- Persistence mechanisms
- System security settings
