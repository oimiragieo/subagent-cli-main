# Linux Reference Guide

## Table of Contents

1. [File System Structure](#file-system-structure)
2. [Important Files and Directories](#important-files-and-directories)
3. [User Account Files](#user-account-files)
4. [System Enumeration](#system-enumeration)
5. [Package Management](#package-management)
6. [User Management](#user-management)
7. [Network Configuration](#network-configuration)
8. [File Manipulation](#file-manipulation)
9. [File Compression](#file-compression)
10. [Persistence Mechanisms](#persistence-mechanisms)
11. [Shell Scripting](#shell-scripting)

---

## File System Structure

| Path    | Description                                         |
| ------- | --------------------------------------------------- |
| `/`     | Anchor and root of the filesystem                   |
| `/bin`  | User binaries                                       |
| `/boot` | Boot-up related files                               |
| `/dev`  | Interface for system devices                        |
| `/etc`  | System configuration files                          |
| `/home` | Base directory for user files                       |
| `/lib`  | Critical software libraries                         |
| `/opt`  | Third party software                                |
| `/proc` | System and running programs                         |
| `/root` | Home directory of root user                         |
| `/sbin` | System administrator binaries                       |
| `/tmp`  | Temporary files                                     |
| `/usr`  | Contains all the system files (less critical files) |
| `/var`  | Variable system files                               |

---

## Important Files and Directories

### Critical System Files

| Path                          | Description                                             |
| ----------------------------- | ------------------------------------------------------- |
| `/etc/shadow`                 | User account information and password hashes            |
| `/etc/passwd`                 | User account information                                |
| `/etc/group`                  | Group names                                             |
| `/etc/rc.d`                   | Startup services (rc0.d-rc6.d)                          |
| `/etc/init.d`                 | Contains startup/stop scripts                           |
| `/etc/hosts`                  | Hardcoded hostname and IP combinations                  |
| `/etc/hostname`               | Full hostname with domain                               |
| `/etc/network/interfaces`     | Network configuration (Debian/Ubuntu)                   |
| `/etc/netplan`                | Network configuration (Ubuntu 18.04+)                   |
| `/etc/profile`                | System environment variables                            |
| `/etc/apt/sources.list`       | Debian package source                                   |
| `/etc/resolv.conf`            | DNS configuration                                       |
| `/etc/fstab`                  | Contains local and network configured mounts and shares |
| `/home/<USER>/.bash_history`  | User Bash history                                       |
| `/usr/share/wireshark/manuf`  | Vendor-MAC lookup (Kali Linux)                          |
| `~/.ssh/`                     | SSH keystore                                            |
| `/var/log`                    | System log files (most Linux)                           |
| `/var/adm`                    | System log files (Unix)                                 |
| `/var/spool/cron`             | List cron files                                         |
| `/var/log/apache2/access.log` | Apache connection log                                   |

---

## User Account Files

### /etc/shadow File Format

```
root:$6$RqNi$...PbED0:16520:0:99999:7:::
```

**Format**: `username:password:lastchange:min:max:warn:inactive:expire:reserved`

| Position | Field                      | Description                                    |
| -------- | -------------------------- | ---------------------------------------------- |
| 1        | Login name                 | Username                                       |
| 2        | Encrypted password         | Password hash                                  |
| 3        | Last password change       | Days since epoch (1970-01-01)                  |
| 4        | Minimum password age       | Days before password can be changed            |
| 5        | Maximum password age       | Days before password must be changed           |
| 6        | Password warning period    | Days before expiration to warn user            |
| 7        | Password inactivity period | Days after expiration before account is locked |
| 8        | Account expiration date    | Days since epoch when account expires          |
| 9        | Reserved                   | Reserved for future use                        |

**Note**: `/etc/login.defs` contains the shadow configuration.

### Shadow Hash Types

Identified by first characters of hash in /etc/shadow:

| Prefix | Hash Type |
| ------ | --------- |
| `$1$`  | MD5       |
| `$2a$` | bcrypt    |
| `$2y$` | bcrypt    |
| `$5$`  | SHA-256   |
| `$6$`  | SHA-512   |

**Example**:

```
kryptonite:$6$n4wLdmr59pt.......:18912:0:99999:7:::
```

The `$6$` indicates SHA-512 hashing.

### /etc/passwd File Format

```
root:x:0:0:Root:/root:/bin/bash
```

**Format**: `username:password:UID:GID:comment:home:shell`

| Position | Field                  | Description                                            |
| -------- | ---------------------- | ------------------------------------------------------ |
| 1        | Login name             | Username                                               |
| 2        | Password               | `x` = password in shadow file, `*` = user cannot login |
| 3        | User ID (UID)          | User ID (root = 0)                                     |
| 4        | Primary Group ID (GID) | Primary group ID                                       |
| 5        | Comment Field          | User full name or description                          |
| 6        | Home directory         | User's home directory                                  |
| 7        | Default shell          | User's default shell                                   |

---

## System Enumeration

### Operating System Information

```bash
# Disk usage
df -h

# Kernel version & CPU information
uname -a
uname -r                              # Kernel version only
uname -m                              # Architecture

# Display OS information
cat /etc/issue
cat /etc/*release*
lsb_release -a                        # Debian/Ubuntu

# Display OS version
cat /etc/os-release

# Display kernel information
cat /proc/version

# Locate shell executables
which bash
which zsh
which tcsh
which csh
which ksh

# Display connected drives
fdisk -l
lsblk

# CPU information
cat /proc/cpuinfo
lscpu

# Memory information
cat /proc/meminfo
free -h

# System uptime
uptime

# Hostname
hostname
cat /etc/hostname

# List all hardware
lshw
lspci                                 # PCI devices
lsusb                                 # USB devices
```

### Situational Awareness

```bash
# Current user/group information
id
whoami
groups

# List logged on users and what they are doing
w

# Show currently logged in users
who
who -a

# Show past and current login and system boot information
last -a
last -f /var/log/wtmp

# Process listing
ps -ef
ps aux
ps -ejH                               # Process tree

# List mounted drives
mount
findmnt
cat /etc/fstab                        # Configured persistent mounts

# Kill processes
kill -9 <PID>                         # Force kill by PID
killall <PROCESS_NAME>                # Kill all by name
pkill <PROCESS_NAME>                  # Kill by pattern

# Show all processes by CPU usage
top
htop                                  # Interactive (if installed)

# Environment variables
env
printenv
echo $PATH
```

---

## Package Management

### RPM (Red Hat Package Manager)

Used by: Red Hat, CentOS, Fedora, SUSE

```bash
# List all installed packages
rpm -qa

# Install all .rpm files in current directory
sudo rpm -ivh *.rpm

# Remove package
sudo rpm -e <PACKAGE_NAME>

# Query package information
rpm -qi <PACKAGE_NAME>

# List files in package
rpm -ql <PACKAGE_NAME>

# Find which package owns a file
rpm -qf /path/to/file

# Verify package
rpm -V <PACKAGE_NAME>
```

### DPKG (Debian Package)

Used by: Debian, Ubuntu, Linux Mint

```bash
# List all installed packages
dpkg --get-selections
dpkg -l

# Install all .deb files in current directory
sudo dpkg -i *.deb

# Remove package
sudo dpkg -r <PACKAGE_NAME>

# Remove package and configuration files
sudo dpkg -P <PACKAGE_NAME>

# List files installed by package
dpkg -L <PACKAGE_NAME>

# Find which package owns a file
dpkg -S /path/to/file

# Reconfigure package
sudo dpkg-reconfigure <PACKAGE_NAME>
```

### APT (Advanced Package Tool)

Used by: Debian, Ubuntu, Linux Mint

```bash
# Update package repositories
sudo apt-get update

# Upgrade all packages
sudo apt-get upgrade

# Intelligently upgrade (handle dependencies)
sudo apt-get dist-upgrade

# Install package
sudo apt-get install <PACKAGE_NAME>

# Remove package
sudo apt-get remove <PACKAGE_NAME>

# Remove package and config files
sudo apt-get purge <PACKAGE_NAME>

# Remove unused dependencies
sudo apt-get autoremove

# Search for package
apt-cache search <PACKAGE_NAME>

# Show package information
apt-cache show <PACKAGE_NAME>

# Clean package cache
sudo apt-get clean
sudo apt-get autoclean
```

### YUM (Yellowdog Updater Modified)

Used by: Red Hat, CentOS, Fedora (older versions)

```bash
# Update package list
sudo yum check-update

# Install package
sudo yum install <PACKAGE_NAME>

# Update all packages
sudo yum update

# Remove package
sudo yum remove <PACKAGE_NAME>

# Search for package
yum search <PACKAGE_NAME>

# List installed packages
yum list installed

# List available packages
yum list available

# Show package information
yum info <PACKAGE_NAME>

# Clean cache
sudo yum clean all
```

---

## User Management

### User Account Enumeration

```bash
# Display user and service accounts
getent passwd
cat /etc/passwd

# Display only usernames
cat /etc/passwd | cut -d: -f1

# Display verbose user information
cat /etc/passwd | column -t -s :

# Check user's groups
groups <USERNAME>
id <USERNAME>

# List all users with UID >= 1000 (actual users)
awk -F: '$3 >= 1000 {print $1}' /etc/passwd

# Currently logged in users
w
who
users

# Last logins
last
lastlog
```

### User Account Configuration

```bash
# Add user
sudo useradd <USERNAME>
sudo useradd -m <USERNAME>            # Create home directory
sudo useradd -m -s /bin/bash <USERNAME>  # Specify shell

# Add user (interactive - Debian/Ubuntu)
sudo adduser <USERNAME>

# Set user password
sudo passwd <USERNAME>

# Change password expiration
sudo chage -l <USERNAME>              # View password aging
sudo chage -M 90 <USERNAME>           # Max 90 days
sudo chage -m 0 <USERNAME>            # Min 0 days
sudo chage -W 7 <USERNAME>            # Warn 7 days before expiry
sudo chage -E 2024-12-31 <USERNAME>   # Account expires on date

# Add user to group
sudo usermod -aG <GROUPNAME> <USERNAME>
sudo usermod -g <GROUPNAME> <USERNAME>  # Change primary group

# Add user to sudo group
sudo usermod -aG sudo <USERNAME>      # Debian/Ubuntu
sudo usermod -aG wheel <USERNAME>     # RHEL/CentOS

# Lock user account
sudo usermod --expiredate 1 --lock --shell /bin/nologin <USERNAME>
sudo passwd -l <USERNAME>             # Lock password

# Unlock user account
sudo usermod --expiredate 99999 --unlock --shell /bin/bash <USERNAME>
sudo passwd -u <USERNAME>             # Unlock password

# Delete user
sudo userdel <USERNAME>
sudo userdel -r <USERNAME>            # Remove home directory

# Enumerate user account details
sudo chage -l <USERNAME>

# Modify user properties
sudo usermod -c "Full Name" <USERNAME>  # Change comment
sudo usermod -d /new/home <USERNAME>    # Change home directory
sudo usermod -s /bin/zsh <USERNAME>     # Change shell
sudo usermod -L <USERNAME>              # Lock account
sudo usermod -U <USERNAME>              # Unlock account
```

### Group Management

```bash
# List all groups
cat /etc/group
getent group

# Create group
sudo groupadd <GROUPNAME>

# Delete group
sudo groupdel <GROUPNAME>

# Add user to group
sudo gpasswd -a <USERNAME> <GROUPNAME>
sudo usermod -aG <GROUPNAME> <USERNAME>

# Remove user from group
sudo gpasswd -d <USERNAME> <GROUPNAME>

# List group members
getent group <GROUPNAME>
grep <GROUPNAME> /etc/group

# Set group password
sudo gpasswd <GROUPNAME>
```

---

## Network Configuration

### Network Information

```bash
# Network interfaces
ifconfig
ip addr show
ip a

# Specific interface
ifconfig eth0
ip addr show eth0

# Routing table
route -n
ip route show
netstat -rn

# DNS configuration
cat /etc/resolv.conf

# Network connections
netstat -tuln                         # Listening TCP/UDP
netstat -ant                          # All TCP connections
netstat -tulpn                        # With PID/program name
ss -tuln                              # Modern alternative
ss -t --all                           # All TCP sockets

# Watch network connections (every 3 seconds)
watch --interval 3 ss -t --all

# List network activity by user
lsof -i -u <USERNAME> -a

# ARP table
arp -n
ip neigh

# Network statistics
netstat -i                            # Interface statistics
netstat -s                            # Protocol statistics
```

### Network Configuration

```bash
# Set IP and netmask (old method)
sudo ifconfig <INTERFACE> <IP> netmask <NETMASK>
# Example:
sudo ifconfig eth0 192.168.1.100 netmask 255.255.255.0

# Set IP (new method)
sudo ip addr add <IP>/<CIDR> dev <INTERFACE>
# Example:
sudo ip addr add 192.168.1.100/24 dev eth0

# Add second IP to existing interface
sudo ifconfig <INTERFACE>:<ALIAS> <IP>
# Example:
sudo ifconfig eth0:0 192.168.1.101

# Or with ip command
sudo ip addr add <IP>/<CIDR> dev <INTERFACE>

# Set gateway (old method)
sudo route add default gw <GATEWAY_IP> <INTERFACE>
# Example:
sudo route add default gw 192.168.1.1 eth0

# Set gateway (new method)
sudo ip route add <IP>/<CIDR> via <GATEWAY_IP> dev <INTERFACE>
sudo ip route add default via <GATEWAY_IP>

# Change MTU size
sudo ifconfig <INTERFACE> mtu <SIZE>
# Or:
sudo ip link set dev <INTERFACE> mtu <SIZE>

# Change MAC address
sudo ifconfig <INTERFACE> hw ether <MAC_ADDRESS>
# Or:
sudo ip link set dev <INTERFACE> down
sudo ip link set dev <INTERFACE> address <MAC_ADDRESS>
sudo ip link set dev <INTERFACE> up

# Enable interface
sudo ifconfig <INTERFACE> up
sudo ip link set <INTERFACE> up

# Disable interface
sudo ifconfig <INTERFACE> down
sudo ip link set <INTERFACE> down

# Restart networking
sudo systemctl restart networking    # Debian/Ubuntu
sudo systemctl restart NetworkManager  # RHEL/CentOS
sudo /etc/init.d/networking restart   # Legacy
```

### DNS Configuration

```bash
# Add DNS server
echo "nameserver <DNS_IP>" | sudo tee -a /etc/resolv.conf

# Or edit directly
sudo nano /etc/resolv.conf

# Example /etc/resolv.conf
nameserver 8.8.8.8
nameserver 8.8.4.4
search example.com

# DNS lookup
dig <DOMAIN>
dig @<DNS_SERVER> <DOMAIN>
host <DOMAIN>
nslookup <DOMAIN>

# Reverse DNS lookup
dig -x <IP>
host <IP>

# DNS zone transfer
dig axfr <DOMAIN> @<DNS_IP>
host -t axfr -l <DOMAIN> <DNS_IP>
```

### Wireless Configuration

```bash
# Built-in Wi-Fi scanner
sudo iwlist <INTERFACE> scan

# Connect to Wi-Fi (using nmcli)
nmcli device wifi list
nmcli device wifi connect <SSID> password <PASSWORD>

# Disconnect Wi-Fi
nmcli device disconnect <INTERFACE>

# Show Wi-Fi status
nmcli device status
nmcli connection show
```

### Advanced Network Operations

```bash
# DHCP assignments log
cat /var/log/messages | grep DHCP
cat /var/log/syslog | grep DHCP

# Kill TCP connections on specific port
sudo tcpkill host <IP> and port <PORT>

# Enable IP forwarding
echo "1" | sudo tee /proc/sys/net/ipv4/ip_forward
# Or persistent:
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf

# NAT/Masquerading
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
```

---

## File Manipulation

### File Operations

```bash
# Compare files
diff <FILE1> <FILE2>
diff -u <FILE1> <FILE2>               # Unified format
diff -y <FILE1> <FILE2>               # Side by side

# Force recursive deletion
rm -rf <DIRECTORY>

# Secure file deletion (overwrite multiple times)
shred -f -u <FILE>
shred -vfz -n 10 <FILE>              # Verbose, 10 passes, zero final

# Modify timestamp to match another file
touch -r <ORIGINAL_FILE> <MOD_FILE>

# Modify file timestamp to specific time
touch -t <YYYYMMDDHHMM> <FILE>
# Example: touch -t 202401011200 file.txt

# Count lines containing specific string
grep -c "<STRING>" <FILE>

# Convert Linux file to Windows format (add \r)
awk 'sub("$", "\r")' <SOURCE_FILE> > <OUTPUT_FILE>

# Convert Windows file to Linux format
dos2unix <FILE>
unix2dos <FILE>                       # Reverse

# Find files by extension
find . -type f -name "*.<EXTENSION>"
find /home -type f -name "*.txt"

# Search files for case-insensitive phrase
grep -Ria "<SEARCH_PHRASE>" .
grep -Ril "<SEARCH_PHRASE>" .        # List filenames only

# Return line count
wc -l <FILE>

# Search for setuid files
find / -perm -4000 -exec ls -ld {} \; 2>/dev/null
find / -perm -2000 2>/dev/null        # SGID files

# Determine file type
file <FILE>

# Set immutable attribute (cannot be modified/deleted)
sudo chattr +i <FILE>

# Unset immutable attribute
sudo chattr -i <FILE>

# List file attributes
lsattr <FILE>

# Generate random file (example: 300MB file)
dd if=/dev/urandom of=<OUTPUT_FILE> bs=3145728 count=100
```

### Advanced Find Operations

```bash
# Find files modified in last 24 hours
find /home -type f -mtime -1

# Find files larger than 100MB
find / -type f -size +100M

# Find files owned by user
find / -user <USERNAME>

# Find files with specific permissions
find / -perm 777

# Find and delete files
find /tmp -type f -name "*.tmp" -delete

# Find and execute command
find /var/log -name "*.log" -exec gzip {} \;

# Find files and change permissions
find /var/www -type f -exec chmod 644 {} \;
find /var/www -type d -exec chmod 755 {} \;
```

---

## File Compression

### tar (Archive)

```bash
# Create archive
tar -cf <OUTPUT>.tar <INPUT_PATH>

# Extract archive
tar -xf <FILE>.tar

# Create gzip compressed archive
tar -czf <OUTPUT>.tar.gz <INPUT_PATH>

# Extract gzip archive
tar -xzf <FILE>.tar.gz

# Create bzip2 compressed archive
tar -cjf <OUTPUT>.tar.bz2 <INPUT_PATH>

# Extract bzip2 archive
tar -xjf <FILE>.tar.bz2

# List contents without extracting
tar -tzf <FILE>.tar.gz
tar -tjf <FILE>.tar.bz2

# Extract to specific directory
tar -xzf <FILE>.tar.gz -C /path/to/destination
```

### gzip/gunzip

```bash
# Compress file
gzip <FILE>

# Decompress file
gzip -d <FILE>.gz
gunzip <FILE>.gz

# Keep original file
gzip -k <FILE>

# Compress with best compression
gzip -9 <FILE>

# Compress multiple files
gzip file1 file2 file3
```

### zip/unzip

```bash
# Compress directory
zip -r <OUTPUT>.zip <DIRECTORY>

# Extract zip file
unzip <FILE>.zip

# Extract to specific directory
unzip <FILE>.zip -d /path/to/destination

# List contents
unzip -l <FILE>.zip

# Add password
zip -r -e <OUTPUT>.zip <DIRECTORY>

# Update existing zip
zip -u <OUTPUT>.zip <NEW_FILE>
```

### UPX (Executable Packer)

```bash
# Pack executable with maximum compression
upx -9 -o <OUTPUT_FILE> <INPUT_FILE>

# Decompress
upx -d <FILE>
```

### Chunking Files

```bash
# Split file into chunks
dd if=<INPUT_FILE> bs=4M | gzip -c | split -b 3K "<OUTPUT_FILE>.chunk"

# Restore chunked file
cat <FILE>.chunk* | gzip -dc | dd of=<OUTPUT_FILE> bs=4M

# Split using split command
split -b 100M <FILE> <PREFIX>      # 100MB chunks
split -n 5 <FILE> <PREFIX>         # Split into 5 parts

# Rejoin files
cat <PREFIX>* > <OUTPUT_FILE>
```

---

## File Hashing

```bash
# MD5 hash
md5sum <FILE>
echo "<STRING>" | md5sum

# SHA1 hash
sha1sum <FILE>

# SHA256 hash
sha256sum <FILE>

# SHA512 hash
sha512sum <FILE>

# Verify hash
sha256sum -c checksums.txt

# Generate checksums for multiple files
find . -type f -exec sha256sum {} \; > checksums.txt
```

---

## Persistence Mechanisms

### rc.local

```bash
# Add command to rc.local (executes on boot)
sudo nano /etc/rc.local

# Or append command
echo "<FULL_PATH_TO_SCRIPT>" | sudo tee -a /etc/rc.local

# Make rc.local executable
sudo chmod +x /etc/rc.local

# Enable rc-local service (systemd)
sudo systemctl enable rc-local
```

### systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/<SERVICE_NAME>.service
```

**Service file content**:

```ini
[Unit]
Description=My Service description
After=network.target

[Service]
Type=simple
Restart=always
ExecStart=<FULL_PATH_TO_SCRIPT>

[Install]
WantedBy=multi-user.target
```

```bash
# Reload systemd daemon
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable <SERVICE_NAME>.service

# Start service
sudo systemctl start <SERVICE_NAME>.service

# Check status
sudo systemctl status <SERVICE_NAME>.service

# View logs
sudo journalctl -u <SERVICE_NAME>.service
```

### Crontab

```bash
# Edit crontab
crontab -e

# List crontab
crontab -l

# Remove crontab
crontab -r

# Edit crontab for specific user
sudo crontab -e -u <USERNAME>

# Cron syntax: minute hour day month weekday command
# Example: Run every day at midnight
0 0 * * * /path/to/script.sh

# Example: Run every hour
0 * * * * /path/to/script.sh

# Example: Run every 5 minutes
*/5 * * * * /path/to/script.sh

# Example: Run at boot
@reboot /path/to/script.sh

# More examples at: https://crontab.guru/
```

### .bashrc / .bash_profile

```bash
# Add command to user's .bashrc
echo '<COMMAND>' >> ~/.bashrc

# Add command to all users' .bashrc
echo '<COMMAND>' | sudo tee -a /etc/bash.bashrc

# Source .bashrc to apply changes
source ~/.bashrc
```

---

## Shell Scripting

### Bash Scripting Examples

#### Ping Sweep

```bash
#!/bin/bash
# Ping sweep for Class C network

for x in {1..254}; do
    ping -c 1 1.1.1.$x | grep "64 bytes" | cut -d" " -f4 >> live.txt
done
```

#### Reverse DNS Lookup

```bash
#!/bin/bash
# Reverse DNS lookup script

echo "Enter Class C Range: i.e. 192.168.3"
read range

for ip in {1..254}; do
    host $range.$ip | grep "name pointer" | cut -d" " -f5
done
```

#### DNS Reverse Lookup with dig

```bash
#!/bin/bash
# DNS reverse lookup using dig

for ip in {1..254}; do
    dig -x 1.1.1.$ip | grep $ip >> dns.txt
done
```

#### Fork Bomb (Educational Only - DO NOT RUN)

```bash
# WARNING: This will crash the system
:(){ :|: & };:
```

**Explanation**: Creates processes recursively until system resources are exhausted.

#### IP Banning Script

```bash
#!/bin/sh
# Ban IPs in subnet (except specific addresses)

i=2
while [[ $i -le 253 ]]; do
    if [[ $i -ne 20 && $i -ne 21 && $i -ne 22 ]]; then
        echo "BANNED: arp -s 192.168.1.$i"
        arp -s 192.168.1.$i 00:00:00:00:00:0a
    else
        echo "IP NOT BANNED: 192.168.1.$i"
        echo "*******************************"
    fi
    i=`expr $i + 1`
done
```

#### Compare Two Files

```bash
#!/bin/bash
# Compare two files for similar lines

for line in $(cat file1.txt); do
    grep -i $line file2.txt
done
```

#### Log Analysis

```bash
#!/bin/bash
# Analyze log files for errors

grep -i "error" /var/log/syslog | wc -l
grep -i "failed" /var/log/auth.log | cut -d" " -f1-3,11
```

#### Batch Process Files

```bash
#!/bin/bash
# Process all .txt files in directory

for file in *.txt; do
    echo "Processing $file"
    # Add your processing commands here
    cat $file | grep "pattern" >> results.txt
done
```

---

## Security Considerations

**WARNING**: Many commands in this reference require root/sudo privileges and should only be used:

- On systems you own or have explicit authorization to access
- For legitimate system administration purposes
- For authorized security testing and penetration testing
- In compliance with organizational policies and legal requirements

**Unauthorized use may violate**:

- Computer Fraud and Abuse Act (CFAA)
- Corporate security policies
- Local and international laws

Always ensure proper authorization before:

- Modifying user accounts or passwords
- Extracting password hashes from /etc/shadow
- Changing network configurations
- Implementing persistence mechanisms
- Running network scans or reconnaissance
- Modifying system files

---

## Additional Resources

- [Linux Documentation Project](https://tldp.org/)
- [Arch Wiki](https://wiki.archlinux.org/)
- [Ubuntu Documentation](https://help.ubuntu.com/)
- [Red Hat Documentation](https://access.redhat.com/documentation/)
- [Linux Command Line Basics](https://linuxcommand.org/)
- [Bash Scripting Guide](https://www.gnu.org/software/bash/manual/)
