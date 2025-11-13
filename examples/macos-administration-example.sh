#!/bin/bash

# macOS System Administration Examples
# Demonstrates comprehensive macOS system management using the System Agent

echo "=== macOS System Administration Examples ==="
echo ""

# Example 1: System Information
echo "Example 1: Gather comprehensive macOS system information"
node ../cli.js system "Display macOS version, hardware info, and system profile"
echo ""

# Example 2: User Management with dscl
echo "Example 2: Enumerate users using Directory Service"
node ../cli.js system "List all non-daemon user accounts on macOS"
echo ""

# Example 3: Service Management
echo "Example 3: List all launchd services and daemons"
node ../cli.js system "Show all loaded LaunchDaemons and LaunchAgents"
echo ""

# Example 4: Network Configuration
echo "Example 4: Display network configuration"
node ../cli.js system "Show all network interfaces and their configurations on macOS"
echo ""

# Example 5: Homebrew Packages
echo "Example 5: List installed Homebrew packages"
node ../cli.js system "Display all installed Homebrew packages and formulas"
echo ""

# Example 6: User Creation
echo "Example 6: Create new user account (requires sudo)"
echo "Usage: dscl . -create /Users/newuser && dscl . -passwd /Users/newuser password"
echo ""

# Example 7: Group Management
echo "Example 7: Enumerate group memberships"
node ../cli.js system "List all groups and their members on macOS"
echo ""

# Example 8: Firewall Status
echo "Example 8: Check macOS firewall configuration"
node ../cli.js system "Display Application Firewall status and rules"
echo ""

# Example 9: SIP Status
echo "Example 9: Check System Integrity Protection status"
node ../cli.js system "Display SIP status and Gatekeeper configuration"
echo ""

# Example 10: File System
echo "Example 10: Display mounted volumes and disk usage"
node ../cli.js system "Show all mounted volumes and file system information"
echo ""

echo ""
echo "=== Advanced macOS Administration ==="
echo ""

# Example 11: User Plist Enumeration
echo "Example 11: Enumerate user property lists (requires sudo)"
echo "Usage: sudo plutil -p /var/db/dslocal/nodes/Default/users/username.plist"
echo ""

# Example 12: Launch Daemons
echo "Example 12: List all LaunchDaemons"
echo "Usage: ls -la /Library/LaunchDaemons/"
echo ""

# Example 13: Keychain Access
echo "Example 13: List keychains"
echo "Usage: security list-keychains"
echo ""

# Example 14: Process Enumeration
echo "Example 14: List running processes"
node ../cli.js system "Display all running processes on macOS with CPU and memory usage"
echo ""

# Example 15: Network Connections
echo "Example 15: Show active network connections"
node ../cli.js system "Display all active TCP connections on macOS"
echo ""

echo ""
echo "=== macOS Security Features ==="
echo ""

# Example 16: FileVault Status
echo "Example 16: Check FileVault encryption status"
echo "Usage: fdesetup status"
echo ""

# Example 17: Gatekeeper
echo "Example 17: Check Gatekeeper status"
echo "Usage: spctl --status"
echo ""

# Example 18: System Logs
echo "Example 18: View system logs"
echo "Usage: log show --predicate 'eventMessage contains \"error\"' --last 1h"
echo ""

# Example 19: Wi-Fi Networks
echo "Example 19: Scan for available Wi-Fi networks"
echo "Usage: /System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s"
echo ""

# Example 20: Disk Management
echo "Example 20: Display disk information"
echo "Usage: diskutil list && diskutil info disk0"
echo ""

echo ""
echo "For detailed macOS reference, see: docs/MACOS-REFERENCE.md"
echo ""
