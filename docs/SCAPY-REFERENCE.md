# Scapy Packet Crafting and Network Analysis Reference

## Table of Contents
- [Introduction](#introduction)
- [Setup and Configuration](#setup-and-configuration)
- [Basic Scapy Commands](#basic-scapy-commands)
- [Packet Crafting](#packet-crafting)
- [Sending and Receiving Packets](#sending-and-receiving-packets)
- [IPv6 Operations](#ipv6-operations)
- [UDP Packet Crafting](#udp-packet-crafting)
- [Protocol Fuzzing](#protocol-fuzzing)
- [HTTP Operations](#http-operations)
- [Packet Sniffing](#packet-sniffing)
- [Advanced Examples](#advanced-examples)
- [Best Practices](#best-practices)

---

## Introduction

Scapy is a powerful Python-based interactive packet manipulation program and library. It can forge or decode packets, send them on the wire, capture them, match requests and replies, and much more.

**Use Cases**:
- Network scanning and discovery
- Packet crafting and analysis
- Protocol fuzzing and testing
- Network security assessment
- Custom protocol development

**WARNING**: Only use Scapy on networks you own or have explicit authorization to test.

---

## Setup and Configuration

### Installation

```bash
# Install via pip
pip install scapy

# Or via package manager (Linux)
sudo apt-get install python3-scapy

# Install on macOS
brew install scapy
```

### IPTables Configuration (Linux)

**CRITICAL**: When crafting TCP packets with Scapy, the underlying OS will not recognize the initial SYN packet and will reply with an RST packet. To prevent this, set the following iptables rule:

```bash
# Block RST packets from interfering with Scapy
iptables -A OUTPUT -p tcp --tcp-flags RST RST -j DROP

# Remove the rule when done
iptables -D OUTPUT -p tcp --tcp-flags RST RST -j DROP

# View current rules
iptables -L OUTPUT -n -v
```

### Import Scapy

```python
from scapy.all import *
```

---

## Basic Scapy Commands

### Exploration Commands

| Command | Description |
|---------|-------------|
| `ls()` | List all available protocols |
| `ls(TCP)` | Show fields of a specific protocol (e.g., TCP) |
| `lsc()` | List all Scapy functions |
| `conf` | Show/set Scapy configuration |
| `conf.iface` | Show/set default network interface |
| `conf.verb` | Set verbosity level (0=silent, 2=default) |

### Examples

```python
from scapy.all import *

# List all protocols
ls()

# Show TCP fields
ls(TCP)

# Show IP fields
ls(IP)

# List all functions
lsc()

# Show configuration
conf

# Set default interface
conf.iface = "eth0"

# Set verbosity (0=quiet, 1=minimal, 2=normal, 3=verbose)
conf.verb = 2
```

---

## Packet Crafting

### Basic IP Packet Creation

```python
from scapy.all import *

# Create IP packet with specific source and destination
ip = IP(src="192.168.1.100", dst="192.168.1.1")

# Display packet details
ip.show()

# Create IP packet with random source IP
ip_random = IP(src=RandIP(), dst="192.168.1.1")
```

### TCP Packet Creation

```python
from scapy.all import *

# Create TCP packet
tcp = TCP(dport=80, sport=12345)

# TCP SYN packet
syn = TCP(dport=80, flags="S")

# TCP ACK packet
ack = TCP(dport=80, flags="A")

# TCP SYN-ACK packet
synack = TCP(dport=80, flags="SA")

# TCP with sequence and acknowledgment numbers
tcp_custom = TCP(dport=80, sport=12345, seq=1000, ack=5000, flags="A")
```

### UDP Packet Creation

```python
from scapy.all import *

# Create UDP packet
udp = UDP(dport=53, sport=12345)

# UDP DNS query
udp_dns = UDP(dport=53, sport=RandShort())
```

### Ethernet Frame Creation

```python
from scapy.all import *

# Create Ethernet frame
eth = Ether(dst="ff:ff:ff:ff:ff:ff", src="00:11:22:33:44:55")

# Create Ethernet frame with random MAC
eth_random = Ether(src=RandMAC())
```

### Layer Stacking

Scapy uses the `/` operator to stack protocol layers:

```python
from scapy.all import *

# IP + TCP
packet = IP(dst="192.168.1.1") / TCP(dport=80)

# Ethernet + IP + TCP
packet = Ether() / IP(dst="192.168.1.1") / TCP(dport=80)

# IP + TCP + Data
packet = IP(dst="192.168.1.1") / TCP(dport=80) / "GET / HTTP/1.1\r\n\r\n"

# Display packet
packet.show()
```

### Adding Data/Payload

```python
from scapy.all import *

# Create IP + TCP packet with data
data = "This is my custom payload"
packet = IP(dst="192.168.1.1") / TCP(dport=80) / data

# Alternative method
ip = IP(src="192.168.1.100", dst="192.168.1.1")
tcp = TCP(dport=80)
data = "TCP data"
packet = ip / tcp / data

# Show packet structure
packet.show()
```

---

## Sending and Receiving Packets

### Send Packets (Layer 3)

```python
from scapy.all import *

# Create packet
packet = IP(dst="192.168.1.1") / ICMP()

# Send 1 packet at Layer 3 (no Ethernet header)
send(packet)

# Send multiple packets
send(packet, count=5)

# Send with inter-packet delay (in seconds)
send(packet, count=10, inter=0.5)

# Example: Send 1000 packets in a loop
for i in range(0, 1000):
    send(packet, verbose=0)
```

### Send Packets (Layer 2)

```python
from scapy.all import *

# Create packet with Ethernet layer
packet = Ether() / IP(dst="192.168.1.1") / TCP(dport=80)

# Send at Layer 2 (includes Ethernet header)
sendp(packet)

# Send multiple packets
sendp(packet, count=2)

# Send on specific interface
sendp(packet, iface="eth0")
```

### Send Packets Fast

```python
from scapy.all import *

# Create packet
packet = IP(dst="192.168.1.1") / UDP(dport=53)

# Send using tcpreplay (much faster)
sendpfast(packet, pps=1000, loop=1000000)
```

### Send and Receive

```python
from scapy.all import *

# Send packet and receive all responses
packet = IP(dst="8.8.8.8") / ICMP()
answered, unanswered = sr(packet, timeout=2)

# Display results
answered.summary()

# Send and receive only first response
response = sr1(packet, timeout=2)
if response:
    response.show()

# Layer 2 send/receive
ans, unans = srp(Ether() / IP(dst="192.168.1.1") / ICMP(), timeout=2)
```

### Examples

```python
from scapy.all import *

# ICMP Ping
def ping(target):
    packet = IP(dst=target) / ICMP()
    response = sr1(packet, timeout=2, verbose=0)
    if response:
        print(f"{target} is alive")
        return True
    else:
        print(f"{target} is down")
        return False

# TCP SYN Scan
def syn_scan(target, port):
    packet = IP(dst=target) / TCP(dport=port, flags="S")
    response = sr1(packet, timeout=1, verbose=0)

    if response:
        if response.haslayer(TCP):
            if response[TCP].flags == 0x12:  # SYN-ACK
                # Send RST to close connection
                rst = IP(dst=target) / TCP(dport=port, flags="R")
                send(rst, verbose=0)
                print(f"Port {port}: OPEN")
                return True
            elif response[TCP].flags == 0x14:  # RST-ACK
                print(f"Port {port}: CLOSED")
                return False

    print(f"Port {port}: FILTERED")
    return False

# Usage
ping("8.8.8.8")
syn_scan("192.168.1.1", 80)
```

---

## IPv6 Operations

### Send IPv6 ICMP Message

```python
from scapy.all import *

# Create IPv6 ICMP packet
packet = IPv6(src="fe80::1", dst="fe80::2") / ICMPv6EchoRequest()

# Send and receive
response = sr1(packet, timeout=2)

if response:
    response.show()
```

### IPv6 Examples

```python
from scapy.all import *

# IPv6 ping
def ping6(target):
    packet = IPv6(dst=target) / ICMPv6EchoRequest()
    response = sr1(packet, timeout=2, verbose=0)
    if response:
        print(f"{target} is alive (IPv6)")
        return True
    return False

# IPv6 neighbor discovery
def ipv6_neighbor_discovery(target):
    packet = IPv6(dst=target) / ICMPv6ND_NS()
    response = sr1(packet, timeout=2, verbose=0)
    if response:
        print(f"Neighbor advertisement received:")
        response.show()
        return response

# IPv6 router solicitation
def ipv6_router_solicitation():
    packet = IPv6(dst="ff02::2") / ICMPv6ND_RS()
    response = sr1(packet, timeout=2, verbose=0)
    if response:
        print("Router advertisement received:")
        response.show()
        return response

# Usage
ping6("2001:4860:4860::8888")  # Google Public DNS IPv6
```

---

## UDP Packet Crafting

### UDP Packet with Specific Payload

```python
from scapy.all import *

# Create UDP packet
ip = IP(src="192.168.1.100", dst="192.168.1.1")
u = UDP(dport=53, sport=12345)
pay = "my UDP packet"
packet = ip / u / pay

# Show packet
packet.show()

# Write to pcap file
wrpcap("udp_packet.pcap", packet)

# Send packet
send(packet)
```

### Advanced UDP Examples

```python
from scapy.all import *

# DNS query
def dns_query(domain, dns_server="8.8.8.8"):
    packet = IP(dst=dns_server) / UDP(dport=53) / DNS(rd=1, qd=DNSQR(qname=domain))
    response = sr1(packet, timeout=2, verbose=0)

    if response and response.haslayer(DNS):
        print(f"DNS Response for {domain}:")
        for i in range(response[DNS].ancount):
            print(f"  {response[DNS].an[i].rdata}")
        return response

# DHCP discover
def dhcp_discover():
    packet = (
        Ether(dst="ff:ff:ff:ff:ff:ff") /
        IP(src="0.0.0.0", dst="255.255.255.255") /
        UDP(sport=68, dport=67) /
        BOOTP(chaddr=RandString(12, b'0123456789abcdef')) /
        DHCP(options=[("message-type", "discover"), "end"])
    )

    response = srp1(packet, timeout=5, verbose=0)
    if response:
        print("DHCP Offer received:")
        response.show()
        return response

# TFTP read request
def tftp_read(server, filename):
    packet = IP(dst=server) / UDP(dport=69) / TFTP() / TFTP_RRQ(filename=filename, mode="octet")
    response = sr1(packet, timeout=2, verbose=0)
    if response:
        response.show()
        return response

# Usage
dns_query("example.com")
# dhcp_discover()  # May require root
# tftp_read("192.168.1.1", "config.txt")
```

---

## Protocol Fuzzing

### NTP Fuzzer

```python
from scapy.all import *

# Create NTP fuzzing packet
packet = IP(src="192.168.1.100", dst="192.168.1.1") / UDP(dport=123) / fuzz(NTP(version=4, mode=4))

# Send packet
send(packet)

# Send multiple fuzzed packets
for i in range(100):
    send(packet, verbose=0)
```

### Advanced Fuzzing Examples

```python
from scapy.all import *

# Fuzz DNS query
def fuzz_dns(target, count=100):
    for i in range(count):
        packet = IP(dst=target) / UDP(dport=53) / fuzz(DNS(qd=DNSQR()))
        send(packet, verbose=0)
    print(f"Sent {count} fuzzed DNS packets to {target}")

# Fuzz DHCP
def fuzz_dhcp(count=50):
    for i in range(count):
        packet = (
            Ether(dst="ff:ff:ff:ff:ff:ff") /
            IP(src="0.0.0.0", dst="255.255.255.255") /
            UDP(sport=68, dport=67) /
            fuzz(BOOTP()) /
            fuzz(DHCP())
        )
        sendp(packet, verbose=0)
    print(f"Sent {count} fuzzed DHCP packets")

# Fuzz TCP options
def fuzz_tcp_options(target, port, count=100):
    for i in range(count):
        packet = IP(dst=target) / fuzz(TCP(dport=port, options=[('MSS', 1460), ('NOP', None)]))
        send(packet, verbose=0)
    print(f"Sent {count} fuzzed TCP packets to {target}:{port}")

# Fuzz ICMP
def fuzz_icmp(target, count=50):
    for i in range(count):
        packet = IP(dst=target) / fuzz(ICMP())
        send(packet, verbose=0)
    print(f"Sent {count} fuzzed ICMP packets to {target}")

# WARNING: Fuzzing can crash systems or cause instability
# Only use on test systems you own
```

---

## HTTP Operations

### Send HTTP Message

```python
from scapy.all import *

# Read HTTP request from file
fileweb = open("web.txt", 'r')
data = fileweb.read()
fileweb.close()

ip = IP(dst="192.168.1.100")

# Three-way handshake and HTTP request
# Step 1: Send SYN
SYN = ip / TCP(sport=RandNum(6000, 7000), dport=80, flags="S", seq=4)

# Step 2: Receive SYN-ACK
SYNACK = sr1(SYN)

# Step 3: Send ACK with HTTP data
ACK = ip / TCP(sport=SYNACK.dport, dport=80, flags="A", seq=SYNACK.ack, ack=SYNACK.seq + 1) / data

# Send and receive response
reply, error = sr(ACK)

# Display response
print(reply.show())
```

### Advanced HTTP Examples

```python
from scapy.all import *

def http_get(target, path="/", port=80):
    """Send HTTP GET request using Scapy"""

    # HTTP GET request
    http_request = f"GET {path} HTTP/1.1\r\nHost: {target}\r\nConnection: close\r\n\r\n"

    ip = IP(dst=target)

    # Three-way handshake
    # SYN
    syn = ip / TCP(sport=RandShort(), dport=port, flags="S", seq=1000)
    synack = sr1(syn, timeout=2, verbose=0)

    if not synack:
        print("No SYN-ACK received")
        return None

    # ACK
    ack = ip / TCP(sport=synack.dport, dport=port, flags="A",
                   seq=synack.ack, ack=synack.seq + 1)
    send(ack, verbose=0)

    # Send HTTP request
    push = ip / TCP(sport=synack.dport, dport=port, flags="PA",
                    seq=synack.ack, ack=synack.seq + 1) / http_request
    response = sr1(push, timeout=5, verbose=0)

    if response and response.haslayer(Raw):
        print("HTTP Response:")
        print(response[Raw].load.decode('utf-8', errors='ignore'))
        return response
    else:
        print("No response received")
        return None

def http_post(target, path="/", data="", port=80):
    """Send HTTP POST request using Scapy"""

    # HTTP POST request
    http_request = (
        f"POST {path} HTTP/1.1\r\n"
        f"Host: {target}\r\n"
        f"Content-Type: application/x-www-form-urlencoded\r\n"
        f"Content-Length: {len(data)}\r\n"
        f"Connection: close\r\n\r\n"
        f"{data}"
    )

    ip = IP(dst=target)

    # Three-way handshake
    syn = ip / TCP(sport=RandShort(), dport=port, flags="S", seq=1000)
    synack = sr1(syn, timeout=2, verbose=0)

    if not synack:
        print("No SYN-ACK received")
        return None

    ack = ip / TCP(sport=synack.dport, dport=port, flags="A",
                   seq=synack.ack, ack=synack.seq + 1)
    send(ack, verbose=0)

    # Send HTTP POST
    push = ip / TCP(sport=synack.dport, dport=port, flags="PA",
                    seq=synack.ack, ack=synack.seq + 1) / http_request
    response = sr1(push, timeout=5, verbose=0)

    if response and response.haslayer(Raw):
        print("HTTP Response:")
        print(response[Raw].load.decode('utf-8', errors='ignore'))
        return response

    return None

# Usage
# http_get("example.com", "/")
# http_post("example.com", "/api/endpoint", "key=value&data=test")
```

---

## Packet Sniffing

### Basic Sniffing

```python
from scapy.all import *

# Sniff 100 packets on default interface
packets = sniff(count=100)

# Sniff on specific interface
packets = sniff(count=100, iface="eth0")

# Sniff with filter (BPF syntax)
packets = sniff(count=50, filter="tcp port 80")

# Sniff with callback function
def packet_callback(packet):
    if packet.haslayer(IP):
        print(f"{packet[IP].src} -> {packet[IP].dst}")

sniff(count=10, prn=packet_callback)
```

### Advanced Sniffing Examples

```python
from scapy.all import *

# Sniff HTTP traffic
def sniff_http(count=100, iface=None):
    """Sniff HTTP packets and display URLs"""
    def process_packet(packet):
        if packet.haslayer(TCP) and packet.haslayer(Raw):
            if packet[TCP].dport == 80 or packet[TCP].sport == 80:
                payload = packet[Raw].load.decode('utf-8', errors='ignore')
                if payload.startswith('GET') or payload.startswith('POST'):
                    print(f"\n[HTTP Request from {packet[IP].src}]")
                    print(payload.split('\r\n')[0])

    packets = sniff(count=count, filter="tcp port 80", prn=process_packet, iface=iface)
    return packets

# Sniff DNS queries
def sniff_dns(count=50, iface=None):
    """Sniff DNS queries and display domain names"""
    def process_packet(packet):
        if packet.haslayer(DNS) and packet.getlayer(DNS).qr == 0:  # Query
            print(f"DNS Query: {packet[DNSQR].qname.decode('utf-8')}")

    packets = sniff(count=count, filter="udp port 53", prn=process_packet, iface=iface)
    return packets

# Sniff credentials (HTTP Basic Auth)
def sniff_credentials(count=100, iface=None):
    """Sniff HTTP Basic Auth credentials"""
    import base64

    def process_packet(packet):
        if packet.haslayer(TCP) and packet.haslayer(Raw):
            payload = packet[Raw].load.decode('utf-8', errors='ignore')
            if 'Authorization: Basic' in payload:
                for line in payload.split('\r\n'):
                    if line.startswith('Authorization: Basic'):
                        encoded = line.split(' ')[2]
                        try:
                            decoded = base64.b64decode(encoded).decode('utf-8')
                            print(f"\n[!] Credentials found: {decoded}")
                            print(f"    Source: {packet[IP].src}")
                        except:
                            pass

    packets = sniff(count=count, filter="tcp port 80", prn=process_packet, iface=iface)
    return packets

# Sniff with timeout
def sniff_with_timeout(timeout=60, filter_str=None):
    """Sniff packets for a specific duration"""
    print(f"Sniffing for {timeout} seconds...")
    packets = sniff(timeout=timeout, filter=filter_str)
    print(f"Captured {len(packets)} packets")
    return packets

# Save captured packets
def sniff_and_save(filename, count=100, filter_str=None):
    """Sniff packets and save to pcap file"""
    packets = sniff(count=count, filter=filter_str)
    wrpcap(filename, packets)
    print(f"Saved {len(packets)} packets to {filename}")
    return packets

# Usage examples (require root/admin privileges)
# sniff_http(count=50)
# sniff_dns(count=20)
# sniff_and_save("capture.pcap", count=100, filter_str="tcp")
```

---

## Advanced Examples

### Port Scanner

```python
from scapy.all import *

def tcp_syn_scan(target, ports):
    """TCP SYN scan on specified ports"""
    open_ports = []

    for port in ports:
        # Create SYN packet
        syn = IP(dst=target) / TCP(dport=port, flags="S")

        # Send and wait for response
        response = sr1(syn, timeout=1, verbose=0)

        if response:
            if response.haslayer(TCP):
                if response[TCP].flags == 0x12:  # SYN-ACK
                    open_ports.append(port)
                    # Send RST to close connection
                    rst = IP(dst=target) / TCP(dport=port, flags="R")
                    send(rst, verbose=0)
                    print(f"Port {port}: OPEN")
                elif response[TCP].flags == 0x14:  # RST-ACK
                    print(f"Port {port}: CLOSED")
        else:
            print(f"Port {port}: FILTERED")

    return open_ports

# Usage
target = "192.168.1.1"
ports = [21, 22, 23, 25, 80, 443, 3389, 8080]
open_ports = tcp_syn_scan(target, ports)
print(f"\nOpen ports: {open_ports}")
```

### ARP Scanner

```python
from scapy.all import *

def arp_scan(network):
    """ARP scan to discover live hosts"""
    # Create ARP request
    arp_request = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=network)

    # Send and receive
    answered, unanswered = srp(arp_request, timeout=2, verbose=0)

    # Parse results
    hosts = []
    for sent, received in answered:
        hosts.append({
            'ip': received.psrc,
            'mac': received.hwsrc
        })
        print(f"IP: {received.psrc:16} | MAC: {received.hwsrc}")

    return hosts

# Usage
network = "192.168.1.0/24"
hosts = arp_scan(network)
print(f"\nDiscovered {len(hosts)} hosts")
```

### Traceroute

```python
from scapy.all import *

def traceroute(target, max_hops=30):
    """Custom traceroute implementation"""
    print(f"Traceroute to {target}, max {max_hops} hops\n")

    for ttl in range(1, max_hops + 1):
        # Create packet with specific TTL
        packet = IP(dst=target, ttl=ttl) / ICMP()

        # Send and receive
        response = sr1(packet, timeout=2, verbose=0)

        if response is None:
            print(f"{ttl:2d}  * * *")
        elif response.type == 0:  # Echo reply
            print(f"{ttl:2d}  {response.src} (destination reached)")
            break
        else:  # Time exceeded
            print(f"{ttl:2d}  {response.src}")

# Usage
traceroute("8.8.8.8")
```

### Packet Analysis

```python
from scapy.all import *

def analyze_pcap(filename):
    """Analyze pcap file and extract statistics"""
    packets = rdpcap(filename)

    print(f"Total packets: {len(packets)}")

    # Protocol distribution
    protocols = {}
    for packet in packets:
        if packet.haslayer(IP):
            proto = packet[IP].proto
            protocols[proto] = protocols.get(proto, 0) + 1

    print("\nProtocol distribution:")
    proto_names = {1: "ICMP", 6: "TCP", 17: "UDP"}
    for proto, count in protocols.items():
        name = proto_names.get(proto, f"Protocol {proto}")
        print(f"  {name}: {count}")

    # Top talkers (IP addresses)
    src_ips = {}
    dst_ips = {}
    for packet in packets:
        if packet.haslayer(IP):
            src = packet[IP].src
            dst = packet[IP].dst
            src_ips[src] = src_ips.get(src, 0) + 1
            dst_ips[dst] = dst_ips.get(dst, 0) + 1

    print("\nTop 5 source IPs:")
    for ip, count in sorted(src_ips.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"  {ip}: {count} packets")

    print("\nTop 5 destination IPs:")
    for ip, count in sorted(dst_ips.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"  {ip}: {count} packets")

# Usage
# analyze_pcap("capture.pcap")
```

---

## Best Practices

### General Guidelines

1. **Authorization**: Always obtain written permission before scanning or testing networks
2. **Rate Limiting**: Use appropriate delays between packets to avoid overwhelming targets
3. **Verbosity**: Set `verbose=0` in production scripts to reduce output
4. **Timeouts**: Always specify timeouts for send/receive operations
5. **Error Handling**: Wrap Scapy operations in try-except blocks
6. **Root Privileges**: Many Scapy operations require root/admin privileges
7. **Interface Selection**: Specify network interface explicitly when needed
8. **Logging**: Log all testing activities for audit purposes

### Performance Optimization

```python
from scapy.all import *

# Disable verbose output
conf.verb = 0

# Use faster sending methods for bulk operations
sendpfast(packet, pps=1000)

# Process packets in batches
packets = [IP(dst=f"192.168.1.{i}") / ICMP() for i in range(1, 255)]
send(packets, verbose=0)

# Use multi-threading for parallel operations
import threading

def scan_port(host, port):
    syn = IP(dst=host) / TCP(dport=port, flags="S")
    response = sr1(syn, timeout=1, verbose=0)
    if response and response.haslayer(TCP) and response[TCP].flags == 0x12:
        print(f"Port {port}: OPEN")

threads = []
for port in range(1, 1024):
    t = threading.Thread(target=scan_port, args=("192.168.1.1", port))
    threads.append(t)
    t.start()

for t in threads:
    t.join()
```

### Security Considerations

```python
# Always clean up
def secure_scan(target, ports):
    """Secure scanning with proper cleanup"""
    try:
        # Perform scan
        for port in ports:
            syn = IP(dst=target) / TCP(dport=port, flags="S")
            response = sr1(syn, timeout=1, verbose=0)

            if response and response.haslayer(TCP):
                if response[TCP].flags == 0x12:
                    # Send RST to properly close connection
                    rst = IP(dst=target) / TCP(dport=port, flags="R", seq=response[TCP].ack)
                    send(rst, verbose=0)
                    print(f"Port {port}: OPEN")

    except KeyboardInterrupt:
        print("\nScan interrupted by user")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        print("Scan completed")

# Usage
secure_scan("192.168.1.1", [80, 443, 8080])
```

---

## Common Scapy Recipes

### Ping Sweep

```python
from scapy.all import *

def ping_sweep(network):
    ans, unans = sr(IP(dst=network) / ICMP(), timeout=2, verbose=0)
    print(f"Live hosts in {network}:")
    for sent, received in ans:
        print(f"  {received.src}")
    return ans

# Usage
ping_sweep("192.168.1.0/24")
```

### MAC Flooding (Testing Only)

```python
from scapy.all import *

def mac_flood(target_ip, count=1000):
    """WARNING: Only use on isolated test networks"""
    for i in range(count):
        packet = Ether(src=RandMAC(), dst=RandMAC()) / IP(src=RandIP(), dst=target_ip) / ICMP()
        sendp(packet, verbose=0)
    print(f"Sent {count} packets with random MACs")

# DON'T USE ON PRODUCTION NETWORKS
```

### VLAN Hopping Detection

```python
from scapy.all import *

def detect_vlan_hopping(iface="eth0", count=100):
    """Detect potential VLAN hopping attempts"""
    def check_packet(packet):
        if packet.haslayer(Dot1Q):
            print(f"VLAN tag detected: VLAN {packet[Dot1Q].vlan} from {packet[Ether].src}")

    sniff(iface=iface, count=count, prn=check_packet, filter="vlan")

# Usage (requires promiscuous mode)
# detect_vlan_hopping("eth0", count=50)
```

---

## Legal and Ethical Notice

**CRITICAL WARNINGS**:

- ✅ **Authorized Use Only**: Use Scapy only on networks you own or have explicit written permission to test
- ✅ **Educational Purpose**: These examples are for learning and authorized security testing
- ✅ **Responsible Disclosure**: Report vulnerabilities through proper channels

- ❌ **Prohibited Uses**: Unauthorized network scanning, packet injection on production networks, DoS attacks, credential theft
- ❌ **Legal Consequences**: Unauthorized use may violate computer fraud and abuse laws

**Always**:
- Obtain written authorization before testing
- Comply with all applicable laws and regulations
- Document all testing activities
- Use test/lab environments when possible
- Respect network resources and availability

**Scapy is a powerful tool. Use it responsibly and ethically.**

---

## Additional Resources

- **Official Documentation**: https://scapy.readthedocs.io/
- **Scapy GitHub**: https://github.com/secdev/scapy
- **Interactive Tutorial**: `scapy` command-line interface
- **Protocol RFCs**: https://www.rfc-editor.org/

- **Related Tools**:
  - Wireshark - Packet analysis
  - tcpdump - Packet capture
  - nmap - Network scanner
  - hping3 - Packet crafting

- **Books**:
  - "Scapy: Packet Crafting for Python" by EONRaider
  - "Black Hat Python" by Justin Seitz
  - "Violent Python" by TJ O'Connor
