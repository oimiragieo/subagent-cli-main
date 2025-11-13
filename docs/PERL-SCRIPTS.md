# Perl Network and Security Scripts Reference

## Table of Contents
- [Introduction](#introduction)
- [Port Scanning](#port-scanning)
- [Network Operations](#network-operations)
- [Web Scraping](#web-scraping)
- [File Operations](#file-operations)
- [System Administration](#system-administration)
- [Advanced Examples](#advanced-examples)
- [Best Practices](#best-practices)

---

## Introduction

Perl (Practical Extraction and Report Language) is a powerful scripting language particularly well-suited for network operations, text processing, and system administration tasks. This reference provides security-focused Perl scripts for authorized testing and administration.

**Use Cases**:
- Network scanning and reconnaissance
- Log file analysis and parsing
- System administration automation
- Web scraping and data extraction
- Security assessment tools

**WARNING**: Only use these scripts on systems you own or have explicit authorization to test.

---

## Port Scanning

### Basic Port Scanner

**Description**: Scan a range of ports on a target IP address

```perl
use strict;
use IO::Socket;

for(my $port=<START_PORT>; $port<<END_PORT>; $port++) {
    my $remote = IO::Socket::INET->new(
        Proto    => "tcp",
        PeerAddr => "<TARGET_IP>",
        PeerPort => $port
    );

    if($remote) {
        print "$port is open\n";
        close($remote);
    }
}
```

**Usage Example**:
```perl
use strict;
use IO::Socket;

# Scan ports 1-1024 on localhost
for(my $port=1; $port<1024; $port++) {
    my $remote = IO::Socket::INET->new(
        Proto    => "tcp",
        PeerAddr => "127.0.0.1",
        PeerPort => $port,
        Timeout  => 1
    );

    if($remote) {
        print "Port $port is open\n";
        close($remote);
    }
}
```

### Advanced Multi-threaded Port Scanner

```perl
#!/usr/bin/perl
use strict;
use warnings;
use IO::Socket;
use threads;
use Thread::Queue;

my $target = $ARGV[0] || die "Usage: $0 <target_ip> <start_port> <end_port> <threads>\n";
my $start_port = $ARGV[1] || 1;
my $end_port = $ARGV[2] || 1024;
my $num_threads = $ARGV[3] || 50;

my $queue = Thread::Queue->new();
my @open_ports;

# Worker thread function
sub scan_port {
    while (my $port = $queue->dequeue_nb()) {
        my $socket = IO::Socket::INET->new(
            Proto    => 'tcp',
            PeerAddr => $target,
            PeerPort => $port,
            Timeout  => 1
        );

        if ($socket) {
            print "Port $port is open\n";
            push @open_ports, $port;
            close($socket);
        }
    }
}

# Fill queue with ports
for (my $port = $start_port; $port <= $end_port; $port++) {
    $queue->enqueue($port);
}

# Create threads
my @threads;
for (1..$num_threads) {
    push @threads, threads->create(\&scan_port);
}

# Wait for all threads to complete
$_->join() for @threads;

# Print summary
print "\n=== Scan Complete ===\n";
print "Target: $target\n";
print "Port range: $start_port-$end_port\n";
print "Open ports: " . join(", ", sort {$a <=> $b} @open_ports) . "\n";
```

**Usage**:
```bash
perl port_scanner.pl 192.168.1.1 1 1024 50
```

### Service Detection Port Scanner

```perl
#!/usr/bin/perl
use strict;
use warnings;
use IO::Socket;

my %services = (
    21   => 'FTP',
    22   => 'SSH',
    23   => 'Telnet',
    25   => 'SMTP',
    53   => 'DNS',
    80   => 'HTTP',
    110  => 'POP3',
    143  => 'IMAP',
    443  => 'HTTPS',
    3306 => 'MySQL',
    3389 => 'RDP',
    5432 => 'PostgreSQL',
    8080 => 'HTTP-Proxy'
);

sub scan_port {
    my ($host, $port) = @_;

    my $socket = IO::Socket::INET->new(
        Proto    => 'tcp',
        PeerAddr => $host,
        PeerPort => $port,
        Timeout  => 2
    );

    return $socket ? 1 : 0;
}

sub grab_banner {
    my ($host, $port) = @_;

    my $socket = IO::Socket::INET->new(
        Proto    => 'tcp',
        PeerAddr => $host,
        PeerPort => $port,
        Timeout  => 2
    ) or return undef;

    # Try to read banner
    my $banner = <$socket>;
    close($socket);

    return $banner;
}

# Main
my $target = $ARGV[0] || die "Usage: $0 <target_ip>\n";

print "Scanning $target for common services...\n\n";

foreach my $port (sort {$a <=> $b} keys %services) {
    if (scan_port($target, $port)) {
        my $service = $services{$port};
        print "[+] Port $port ($service) is open\n";

        my $banner = grab_banner($target, $port);
        if ($banner) {
            chomp($banner);
            print "    Banner: $banner\n";
        }
    }
}

print "\nScan complete.\n";
```

---

## Network Operations

### Ping Sweep

```perl
#!/usr/bin/perl
use strict;
use warnings;
use Net::Ping;

my $network = $ARGV[0] || die "Usage: $0 <network> (e.g., 192.168.1)\n";

print "Ping sweep of $network.0/24\n\n";

my $ping = Net::Ping->new('icmp', 1);  # 1 second timeout

for (my $i = 1; $i <= 254; $i++) {
    my $host = "$network.$i";

    if ($ping->ping($host)) {
        print "[+] $host is alive\n";
    }
}

$ping->close();
print "\nSweep complete.\n";
```

### DNS Lookup Tool

```perl
#!/usr/bin/perl
use strict;
use warnings;
use Socket;

sub resolve_hostname {
    my ($hostname) = @_;

    my $packed_ip = gethostbyname($hostname);

    if (defined $packed_ip) {
        my $ip = inet_ntoa($packed_ip);
        return $ip;
    }

    return undef;
}

sub reverse_lookup {
    my ($ip) = @_;

    my $packed_ip = inet_aton($ip);
    my $hostname = gethostbyaddr($packed_ip, AF_INET);

    return $hostname || "No PTR record";
}

# Main
my $target = $ARGV[0] || die "Usage: $0 <hostname_or_ip>\n";

# Check if target looks like an IP
if ($target =~ /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/) {
    # Reverse lookup
    print "Reverse lookup for $target:\n";
    my $hostname = reverse_lookup($target);
    print "Hostname: $hostname\n";
} else {
    # Forward lookup
    print "DNS lookup for $target:\n";
    my $ip = resolve_hostname($target);

    if ($ip) {
        print "IP Address: $ip\n";

        # Also do reverse lookup
        my $reverse = reverse_lookup($ip);
        print "Reverse: $reverse\n";
    } else {
        print "Could not resolve hostname\n";
    }
}
```

### HTTP Request Tool

```perl
#!/usr/bin/perl
use strict;
use warnings;
use LWP::UserAgent;
use HTTP::Request;

my $url = $ARGV[0] || die "Usage: $0 <url>\n";

my $ua = LWP::UserAgent->new();
$ua->timeout(10);
$ua->agent('Mozilla/5.0');

my $request = HTTP::Request->new(GET => $url);
my $response = $ua->request($request);

if ($response->is_success) {
    print "Status: " . $response->status_line . "\n";
    print "Content-Type: " . $response->content_type . "\n";
    print "Server: " . ($response->header('Server') || 'Unknown') . "\n";
    print "\n=== Headers ===\n";
    print $response->headers->as_string;
    print "\n=== Content ===\n";
    print $response->decoded_content . "\n";
} else {
    print "Error: " . $response->status_line . "\n";
}
```

### Network Interface Information

```perl
#!/usr/bin/perl
use strict;
use warnings;

sub get_interfaces {
    my @interfaces;

    if ($^O eq 'linux' || $^O eq 'darwin') {
        # Linux/macOS
        open(my $fh, '-|', 'ifconfig -a') or die "Cannot run ifconfig: $!";

        my $current_if = '';
        while (<$fh>) {
            if (/^(\w+):?\s/) {
                $current_if = $1;
                push @interfaces, $current_if;
            } elsif (/inet\s+(\d+\.\d+\.\d+\.\d+)/) {
                print "$current_if: $1\n";
            }
        }
        close($fh);
    } elsif ($^O eq 'MSWin32') {
        # Windows
        open(my $fh, '-|', 'ipconfig') or die "Cannot run ipconfig: $!";

        while (<$fh>) {
            if (/IPv4 Address.*:\s*(\d+\.\d+\.\d+\.\d+)/) {
                print "Interface: $1\n";
            }
        }
        close($fh);
    }

    return @interfaces;
}

print "Network Interfaces:\n";
get_interfaces();
```

---

## Web Scraping

### Simple Web Scraper

```perl
#!/usr/bin/perl
use strict;
use warnings;
use LWP::Simple;

my $url = $ARGV[0] || die "Usage: $0 <url>\n";

my $content = get($url);

if ($content) {
    # Extract all links
    my @links = $content =~ /<a\s+href="([^"]+)"/gi;

    print "Links found on $url:\n";
    foreach my $link (@links) {
        print "  $link\n";
    }
} else {
    print "Could not retrieve $url\n";
}
```

### Advanced Web Scraper with HTML Parser

```perl
#!/usr/bin/perl
use strict;
use warnings;
use LWP::UserAgent;
use HTML::TreeBuilder;

my $url = $ARGV[0] || die "Usage: $0 <url>\n";

# Create user agent
my $ua = LWP::UserAgent->new();
$ua->timeout(10);
$ua->agent('Mozilla/5.0');

# Fetch page
my $response = $ua->get($url);

if ($response->is_success) {
    # Parse HTML
    my $tree = HTML::TreeBuilder->new();
    $tree->parse($response->decoded_content);
    $tree->eof();

    # Extract title
    my $title_elem = $tree->look_down('_tag', 'title');
    my $title = $title_elem ? $title_elem->as_text : 'No title';
    print "Title: $title\n\n";

    # Extract all links
    print "Links:\n";
    foreach my $link ($tree->look_down('_tag', 'a')) {
        my $href = $link->attr('href');
        my $text = $link->as_text;
        print "  $text -> $href\n" if $href;
    }

    # Extract all images
    print "\nImages:\n";
    foreach my $img ($tree->look_down('_tag', 'img')) {
        my $src = $img->attr('src');
        my $alt = $img->attr('alt') || 'No alt text';
        print "  $alt -> $src\n" if $src;
    }

    # Extract all form inputs
    print "\nForms:\n";
    foreach my $form ($tree->look_down('_tag', 'form')) {
        my $action = $form->attr('action') || '';
        my $method = $form->attr('method') || 'GET';
        print "  Form: $method $action\n";

        foreach my $input ($form->look_down('_tag', 'input')) {
            my $name = $input->attr('name') || '';
            my $type = $input->attr('type') || 'text';
            print "    Input: $name ($type)\n" if $name;
        }
    }

    $tree->delete();
} else {
    print "Error: " . $response->status_line . "\n";
}
```

### HTTP Header Analyzer

```perl
#!/usr/bin/perl
use strict;
use warnings;
use LWP::UserAgent;

my $url = $ARGV[0] || die "Usage: $0 <url>\n";

my $ua = LWP::UserAgent->new();
$ua->timeout(10);

my $response = $ua->head($url);

print "URL: $url\n";
print "Status: " . $response->status_line . "\n\n";

print "=== Response Headers ===\n";
foreach my $header ($response->header_field_names) {
    print sprintf("%-20s: %s\n", $header, $response->header($header));
}

# Security header analysis
print "\n=== Security Headers ===\n";
my %security_headers = (
    'Strict-Transport-Security' => 'HSTS',
    'X-Frame-Options'           => 'Clickjacking Protection',
    'X-Content-Type-Options'    => 'MIME Sniffing Protection',
    'X-XSS-Protection'          => 'XSS Protection',
    'Content-Security-Policy'   => 'CSP'
);

foreach my $header (keys %security_headers) {
    my $value = $response->header($header);
    if ($value) {
        print "[+] $security_headers{$header}: Present\n";
        print "    $value\n";
    } else {
        print "[-] $security_headers{$header}: Missing\n";
    }
}
```

---

## File Operations

### Log File Parser

```perl
#!/usr/bin/perl
use strict;
use warnings;

my $logfile = $ARGV[0] || die "Usage: $0 <logfile> [pattern]\n";
my $pattern = $ARGV[1] || '.';  # Default: match everything

open(my $fh, '<', $logfile) or die "Cannot open $logfile: $!";

print "Parsing $logfile for pattern: $pattern\n\n";

my %stats;
my $line_count = 0;
my $match_count = 0;

while (my $line = <$fh>) {
    $line_count++;

    if ($line =~ /$pattern/i) {
        $match_count++;
        print $line;

        # Extract IP addresses
        while ($line =~ /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g) {
            $stats{ips}{$1}++;
        }

        # Extract HTTP status codes
        if ($line =~ /HTTP\/\d\.\d"\s+(\d{3})/) {
            $stats{status_codes}{$1}++;
        }
    }
}

close($fh);

# Print statistics
print "\n=== Statistics ===\n";
print "Total lines: $line_count\n";
print "Matching lines: $match_count\n";

if ($stats{ips}) {
    print "\nTop 10 IP addresses:\n";
    my $count = 0;
    foreach my $ip (sort { $stats{ips}{$b} <=> $stats{ips}{$a} } keys %{$stats{ips}}) {
        last if ++$count > 10;
        print "  $ip: $stats{ips}{$ip}\n";
    }
}

if ($stats{status_codes}) {
    print "\nHTTP Status Codes:\n";
    foreach my $code (sort keys %{$stats{status_codes}}) {
        print "  $code: $stats{status_codes}{$code}\n";
    }
}
```

### File Search and Replace

```perl
#!/usr/bin/perl
use strict;
use warnings;
use File::Find;

my ($dir, $search, $replace) = @ARGV;

die "Usage: $0 <directory> <search_pattern> <replace_text>\n"
    unless $dir && $search && defined $replace;

my @files;

# Find all files
find(sub {
    push @files, $File::Find::name if -f;
}, $dir);

print "Found " . scalar(@files) . " files\n";
print "Searching for: $search\n";
print "Replacing with: $replace\n\n";

my $total_replacements = 0;

foreach my $file (@files) {
    # Skip binary files
    next unless -T $file;

    # Read file
    open(my $in, '<', $file) or next;
    my @lines = <$in>;
    close($in);

    my $count = 0;
    my $modified = 0;

    # Replace
    foreach my $line (@lines) {
        if ($line =~ s/$search/$replace/g) {
            $count++;
            $modified = 1;
        }
    }

    # Write back if modified
    if ($modified) {
        open(my $out, '>', $file) or die "Cannot write $file: $!";
        print $out @lines;
        close($out);

        print "[+] $file: $count replacement(s)\n";
        $total_replacements += $count;
    }
}

print "\nTotal replacements: $total_replacements\n";
```

### File Hash Calculator

```perl
#!/usr/bin/perl
use strict;
use warnings;
use Digest::MD5;
use Digest::SHA;

my $file = $ARGV[0] || die "Usage: $0 <file>\n";

die "File not found: $file\n" unless -f $file;

open(my $fh, '<', $file) or die "Cannot open $file: $!";
binmode($fh);

# Calculate MD5
my $md5 = Digest::MD5->new;
$md5->addfile($fh);
my $md5_hex = $md5->hexdigest;

# Calculate SHA-1
seek($fh, 0, 0);  # Reset file pointer
my $sha1 = Digest::SHA->new('sha1');
$sha1->addfile($fh);
my $sha1_hex = $sha1->hexdigest;

# Calculate SHA-256
seek($fh, 0, 0);
my $sha256 = Digest::SHA->new('sha256');
$sha256->addfile($fh);
my $sha256_hex = $sha256->hexdigest;

close($fh);

# Get file info
my $size = -s $file;
my $mtime = (stat($file))[9];
my $mtime_str = localtime($mtime);

print "File: $file\n";
print "Size: $size bytes\n";
print "Modified: $mtime_str\n\n";
print "MD5:    $md5_hex\n";
print "SHA-1:  $sha1_hex\n";
print "SHA-256: $sha256_hex\n";
```

---

## System Administration

### Process Monitor

```perl
#!/usr/bin/perl
use strict;
use warnings;

sub get_processes {
    my @processes;

    if ($^O eq 'linux' || $^O eq 'darwin') {
        # Unix/Linux/macOS
        open(my $fh, '-|', 'ps aux') or die "Cannot run ps: $!";

        while (<$fh>) {
            next if /^\s*USER/;  # Skip header
            my @fields = split(/\s+/, $_, 11);

            push @processes, {
                user    => $fields[0],
                pid     => $fields[1],
                cpu     => $fields[2],
                mem     => $fields[3],
                command => $fields[10]
            };
        }
        close($fh);
    } elsif ($^O eq 'MSWin32') {
        # Windows
        open(my $fh, '-|', 'tasklist /V /FO CSV') or die "Cannot run tasklist: $!";

        <$fh>;  # Skip header
        while (<$fh>) {
            chomp;
            my @fields = split(/,/, $_);

            push @processes, {
                name => $fields[0],
                pid  => $fields[1],
                mem  => $fields[4]
            };
        }
        close($fh);
    }

    return @processes;
}

# Main
print "Process List:\n";
print "=" x 80 . "\n";

my @procs = get_processes();

# Sort by CPU usage (Unix) or memory (Windows)
if ($^O eq 'linux' || $^O eq 'darwin') {
    @procs = sort { $b->{cpu} <=> $a->{cpu} } @procs;

    printf("%-10s %8s %6s %6s %s\n", "USER", "PID", "CPU%", "MEM%", "COMMAND");
    print "-" x 80 . "\n";

    foreach my $proc (@procs[0..19]) {  # Top 20
        printf("%-10s %8s %6.1f %6.1f %s\n",
               $proc->{user}, $proc->{pid}, $proc->{cpu}, $proc->{mem},
               substr($proc->{command}, 0, 40));
    }
} else {
    printf("%-30s %10s %15s\n", "NAME", "PID", "MEMORY");
    print "-" x 80 . "\n";

    foreach my $proc (@procs[0..19]) {
        printf("%-30s %10s %15s\n", $proc->{name}, $proc->{pid}, $proc->{mem});
    }
}
```

### Disk Usage Analyzer

```perl
#!/usr/bin/perl
use strict;
use warnings;
use File::Find;

my $dir = $ARGV[0] || '.';

die "Directory not found: $dir\n" unless -d $dir;

my %sizes;
my $total_size = 0;

find(sub {
    return unless -f;

    my $size = -s;
    $sizes{$File::Find::dir} += $size;
    $total_size += $size;
}, $dir);

sub format_bytes {
    my ($bytes) = @_;

    my @units = qw(B KB MB GB TB);
    my $unit = 0;

    while ($bytes >= 1024 && $unit < $#units) {
        $bytes /= 1024;
        $unit++;
    }

    return sprintf("%.2f %s", $bytes, $units[$unit]);
}

print "Disk Usage Analysis for: $dir\n";
print "Total Size: " . format_bytes($total_size) . "\n\n";

print "Top 20 Directories:\n";
print "-" x 80 . "\n";

my $count = 0;
foreach my $directory (sort { $sizes{$b} <=> $sizes{$a} } keys %sizes) {
    last if ++$count > 20;

    my $size = format_bytes($sizes{$directory});
    my $percent = ($sizes{$directory} / $total_size) * 100;

    printf("%-60s %12s (%5.1f%%)\n", $directory, $size, $percent);
}
```

### System Information Gatherer

```perl
#!/usr/bin/perl
use strict;
use warnings;
use POSIX qw(uname);

sub get_os_info {
    my ($sysname, $nodename, $release, $version, $machine) = POSIX::uname();

    print "=== System Information ===\n";
    print "Operating System: $sysname\n";
    print "Hostname: $nodename\n";
    print "Kernel Release: $release\n";
    print "Kernel Version: $version\n";
    print "Architecture: $machine\n\n";
}

sub get_uptime {
    print "=== Uptime ===\n";

    if ($^O eq 'linux' || $^O eq 'darwin') {
        system('uptime');
    } elsif ($^O eq 'MSWin32') {
        system('systeminfo | findstr /C:"System Boot Time"');
    }
    print "\n";
}

sub get_memory_info {
    print "=== Memory Information ===\n";

    if ($^O eq 'linux') {
        system('free -h');
    } elsif ($^O eq 'darwin') {
        system('vm_stat');
    } elsif ($^O eq 'MSWin32') {
        system('systeminfo | findstr /C:"Total Physical Memory" /C:"Available Physical Memory"');
    }
    print "\n";
}

sub get_disk_info {
    print "=== Disk Information ===\n";

    if ($^O eq 'linux' || $^O eq 'darwin') {
        system('df -h');
    } elsif ($^O eq 'MSWin32') {
        system('wmic logicaldisk get caption,freespace,size');
    }
    print "\n";
}

# Main
get_os_info();
get_uptime();
get_memory_info();
get_disk_info();
```

---

## Advanced Examples

### Multi-Protocol Service Scanner

```perl
#!/usr/bin/perl
use strict;
use warnings;
use IO::Socket;
use threads;
use Thread::Queue;

my %protocols = (
    21   => { name => 'FTP',   banner => 1 },
    22   => { name => 'SSH',   banner => 1 },
    25   => { name => 'SMTP',  banner => 1 },
    80   => { name => 'HTTP',  banner => 0 },
    443  => { name => 'HTTPS', banner => 0 },
    3306 => { name => 'MySQL', banner => 1 },
);

sub scan_service {
    my ($host, $port) = @_;

    my $socket = IO::Socket::INET->new(
        Proto    => 'tcp',
        PeerAddr => $host,
        PeerPort => $port,
        Timeout  => 2
    ) or return undef;

    my $result = {
        port    => $port,
        service => $protocols{$port}{name} || 'Unknown',
        status  => 'open'
    };

    # Grab banner if applicable
    if ($protocols{$port}{banner}) {
        my $banner;
        eval {
            local $SIG{ALRM} = sub { die "timeout\n" };
            alarm(2);
            $banner = <$socket>;
            alarm(0);
        };

        if ($banner) {
            chomp($banner);
            $result->{banner} = $banner;
        }
    }

    close($socket);
    return $result;
}

# Main
my $target = $ARGV[0] || die "Usage: $0 <target>\n";

print "Scanning $target for common services...\n\n";

foreach my $port (sort {$a <=> $b} keys %protocols) {
    my $result = scan_service($target, $port);

    if ($result) {
        print "[+] Port $port ($result->{service}): $result->{status}\n";
        print "    Banner: $result->{banner}\n" if $result->{banner};
    }
}

print "\nScan complete.\n";
```

### Automated Network Mapper

```perl
#!/usr/bin/perl
use strict;
use warnings;
use Net::Ping;
use IO::Socket;

my $network = $ARGV[0] || die "Usage: $0 <network> (e.g., 192.168.1)\n";

my @common_ports = (21, 22, 23, 25, 53, 80, 110, 143, 443, 3306, 3389, 8080);

print "Network Mapping: $network.0/24\n";
print "=" x 60 . "\n\n";

my $ping = Net::Ping->new('icmp', 1);

for (my $i = 1; $i <= 254; $i++) {
    my $host = "$network.$i";

    if ($ping->ping($host)) {
        print "[+] $host is alive\n";

        # Scan common ports
        my @open_ports;
        foreach my $port (@common_ports) {
            my $sock = IO::Socket::INET->new(
                Proto    => 'tcp',
                PeerAddr => $host,
                PeerPort => $port,
                Timeout  => 1
            );

            if ($sock) {
                push @open_ports, $port;
                close($sock);
            }
        }

        if (@open_ports) {
            print "    Open ports: " . join(", ", @open_ports) . "\n";
        }

        # Try to get hostname
        my $hostname = gethostbyaddr(inet_aton($host), AF_INET) || "Unknown";
        print "    Hostname: $hostname\n" if $hostname ne "Unknown";

        print "\n";
    }
}

$ping->close();
print "Network mapping complete.\n";

use Socket;  # Need this for inet_aton
```

---

## Best Practices

### Error Handling

```perl
#!/usr/bin/perl
use strict;
use warnings;
use Try::Tiny;

# Using eval
eval {
    # Potentially dangerous code
    open(my $fh, '<', 'nonexistent.txt') or die $!;
};
if ($@) {
    print "Error: $@\n";
}

# Using Try::Tiny (preferred)
try {
    open(my $fh, '<', 'nonexistent.txt') or die $!;
} catch {
    print "Caught error: $_\n";
};
```

### Secure Input Handling

```perl
#!/usr/bin/perl
use strict;
use warnings;

# Validate IP address
sub is_valid_ip {
    my ($ip) = @_;
    return $ip =~ /^(\d{1,3}\.){3}\d{1,3}$/;
}

# Validate port number
sub is_valid_port {
    my ($port) = @_;
    return $port =~ /^\d+$/ && $port >= 1 && $port <= 65535;
}

# Sanitize filename
sub sanitize_filename {
    my ($filename) = @_;
    $filename =~ s/[^a-zA-Z0-9._-]//g;
    return $filename;
}

# Example usage
my $ip = $ARGV[0];
my $port = $ARGV[1];

die "Invalid IP address\n" unless is_valid_ip($ip);
die "Invalid port number\n" unless is_valid_port($port);

print "Valid input: $ip:$port\n";
```

### Logging

```perl
#!/usr/bin/perl
use strict;
use warnings;

sub log_message {
    my ($level, $message) = @_;

    my $timestamp = localtime();
    my $log_entry = "[$timestamp] [$level] $message\n";

    # Print to STDOUT
    print $log_entry;

    # Append to log file
    open(my $fh, '>>', 'script.log') or die "Cannot open log file: $!";
    print $fh $log_entry;
    close($fh);
}

# Usage
log_message('INFO', 'Script started');
log_message('WARNING', 'Potential issue detected');
log_message('ERROR', 'Critical error occurred');
```

### Configuration Files

```perl
#!/usr/bin/perl
use strict;
use warnings;
use Config::Simple;

# Create configuration
my $cfg = new Config::Simple(syntax => 'ini');

$cfg->param('target.ip', '192.168.1.1');
$cfg->param('target.ports', '80,443,8080');
$cfg->param('scan.timeout', 5);
$cfg->param('scan.threads', 10);

$cfg->write('config.ini');

# Read configuration
my $config = new Config::Simple('config.ini');

my $ip = $config->param('target.ip');
my $timeout = $config->param('scan.timeout');

print "Target: $ip\n";
print "Timeout: $timeout\n";
```

---

## Security Considerations

### Authorization and Legal Use

**CRITICAL**: Only use these scripts on:
- Systems you own
- Systems you have explicit written permission to test
- Authorized penetration testing engagements
- Educational lab environments

**Prohibited Uses**:
- Unauthorized network scanning
- Accessing systems without permission
- Denial of service attacks
- Data theft or destruction

### Rate Limiting

```perl
# Add delays to avoid overwhelming targets
use Time::HiRes qw(sleep);

foreach my $port (@ports) {
    scan_port($target, $port);
    sleep(0.1);  # 100ms delay
}
```

### Audit Logging

```perl
# Log all activities
sub audit_log {
    my ($action, $target, $result) = @_;

    my $timestamp = localtime();
    my $log_entry = sprintf("[%s] Action: %s | Target: %s | Result: %s\n",
                            $timestamp, $action, $target, $result);

    open(my $fh, '>>', 'audit.log') or die $!;
    print $fh $log_entry;
    close($fh);
}

# Usage
audit_log('PORT_SCAN', '192.168.1.1:80', 'OPEN');
```

---

## Common Perl Modules for Security

### Essential CPAN Modules

```bash
# Install via CPAN
cpan install LWP::UserAgent
cpan install Net::Ping
cpan install IO::Socket::SSL
cpan install HTTP::Request
cpan install HTML::TreeBuilder
cpan install Digest::MD5
cpan install Digest::SHA
cpan install Net::SSH::Perl
cpan install Net::FTP
cpan install Net::SMTP
```

### Module Usage Examples

```perl
# SSL/TLS connections
use IO::Socket::SSL;

my $socket = IO::Socket::SSL->new(
    PeerHost => 'secure.example.com',
    PeerPort => 443,
    SSL_verify_mode => SSL_VERIFY_NONE
);

# FTP operations
use Net::FTP;

my $ftp = Net::FTP->new('ftp.example.com') or die "Cannot connect: $@";
$ftp->login('username', 'password');
$ftp->get('file.txt');
$ftp->quit;

# SSH connections
use Net::SSH::Perl;

my $ssh = Net::SSH::Perl->new('remote.example.com');
$ssh->login('username', 'password');
my ($stdout, $stderr, $exit) = $ssh->cmd('ls -la');
print $stdout;
```

---

## Legal and Ethical Notice

**WARNING**: These Perl scripts are provided for educational purposes and authorized security testing only.

- ✅ **Authorized Use**: Penetration testing with written permission, security research on owned systems, CTF competitions, system administration
- ❌ **Unauthorized Use**: Scanning/testing systems without permission, accessing unauthorized networks, malicious activities, data theft

**Always**:
- Obtain written authorization before testing
- Comply with local laws and regulations
- Follow responsible disclosure practices
- Respect privacy and data protection laws
- Document all testing activities with audit logs

**Unauthorized access to computer systems is illegal in most jurisdictions and may result in criminal charges.**

---

## Additional Resources

- **CPAN** (Comprehensive Perl Archive Network): https://www.cpan.org/
- **Perl Documentation**: https://perldoc.perl.org/
- **PerlMonks**: https://www.perlmonks.org/
- **Modern Perl**: http://modernperlbooks.com/

- **Books**:
  - "Programming Perl" by Larry Wall (The Camel Book)
  - "Perl Network Programming" by Lincoln D. Stein
  - "Mastering Perl for Bioinformatics" by James Tisdall

- **Security Tools**:
  - Nikto - Web server scanner (written in Perl)
  - OpenVAS - Vulnerability scanner
  - Nmap NSE scripts (many written in Lua, similar concepts)
