# Regular Expressions and ASCII Reference Guide

## Table of Contents
- [Regular Expression Patterns](#regular-expression-patterns)
- [Regex Examples](#regex-examples)
- [ASCII Table](#ascii-table)

---

## Regular Expression Patterns

### Basic Metacharacters

| Pattern | Description |
|---------|-------------|
| `^` | Start of string |
| `$` | End of string |
| `.` | Any character except newline `\n` |
| `*` | 0 or more occurrences |
| `+` | 1 or more occurrences |
| `?` | 0 or 1 occurrence |

### Quantifiers

| Pattern | Description |
|---------|-------------|
| `{3}` | Exactly 3 occurrences |
| `{3,}` | 3 or more occurrences |
| `{3,5}` | 3 to 5 occurrences |
| `{3\|5}` | 3 or 5 occurrences |

### Character Classes

| Pattern | Description |
|---------|-------------|
| `[345]` | Match 3 or 4 or 5 |
| `[^34]` | Match anything except 3 or 4 |
| `[a-z]` | Lowercase letters a through z |
| `[A-Z]` | Uppercase letters A through Z |
| `[0-9]` | Digits 0 through 9 |

### Special Character Classes

| Pattern | Description |
|---------|-------------|
| `\d` | Digit (equivalent to `[0-9]`) |
| `\D` | Not a digit |
| `\w` | Word character (A-Z, a-z, 0-9, _) |
| `\W` | Not a word character |
| `\s` | Whitespace (`\t`, `\r`, `\n`, `\f`) |
| `\S` | Not whitespace |

---

## Regex Examples

### Basic Patterns

```regex
reg[ex]         # Matches "rege" or "regx"
regex?          # Matches "rege" or "regex"
regex*          # Matches "rege" with 0 or more 'x'
regex+          # Matches "rege" with 1 or more 'x'
[Rr]egex        # Matches "Regex" or "regex"
```

### Digit Patterns

```regex
\d{3}           # Exactly 3 digits
\d{3,}          # 3 or more digits
[aeiou]         # Any single vowel
```

### Range Patterns

```regex
(0[3-9]|1[0-9]|2[0-5])    # Numbers 03-25
```

### Common Use Cases

#### Email Validation
```regex
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
```

#### IP Address Validation
```regex
^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$
```

#### Phone Number (US Format)
```regex
^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$
```

#### URL Validation
```regex
^https?://[^\s/$.?#].[^\s]*$
```

#### MAC Address
```regex
^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$
```

#### Date Format (YYYY-MM-DD)
```regex
^\d{4}-\d{2}-\d{2}$
```

#### Username (alphanumeric, 3-16 chars)
```regex
^[a-zA-Z0-9_]{3,16}$
```

#### Strong Password (min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special)
```regex
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$
```

#### IPv6 Address
```regex
^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})$
```

#### Hex Color Code
```regex
^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$
```

---

## ASCII Table

### Control Characters (0x00 - 0x1F)

| HEX | ASCII | Description |
|-----|-------|-------------|
| `x00` | NUL | Null character |
| `x08` | BS | Backspace |
| `x09` | TAB | Horizontal tab |
| `x0a` | LF | Line feed (newline) |
| `x0d` | CR | Carriage return |
| `x1b` | ESC | Escape |

### Printable Characters (0x20 - 0x7E)

#### Special Characters & Punctuation

| HEX | ASCII | HEX | ASCII | HEX | ASCII | HEX | ASCII |
|-----|-------|-----|-------|-----|-------|-----|-------|
| `x20` | SPC | `x21` | ! | `x22` | " | `x23` | # |
| `x24` | $ | `x25` | % | `x26` | & | `x27` | ' |
| `x28` | ( | `x29` | ) | `x2a` | * | `x2b` | + |
| `x2c` | , | `x2d` | - | `x2e` | . | `x2f` | / |

#### Digits (0-9)

| HEX | ASCII | HEX | ASCII | HEX | ASCII | HEX | ASCII |
|-----|-------|-----|-------|-----|-------|-----|-------|
| `x30` | 0 | `x31` | 1 | `x32` | 2 | `x33` | 3 |
| `x34` | 4 | `x35` | 5 | `x36` | 6 | `x37` | 7 |
| `x38` | 8 | `x39` | 9 |

#### More Punctuation

| HEX | ASCII | HEX | ASCII | HEX | ASCII | HEX | ASCII |
|-----|-------|-----|-------|-----|-------|-----|-------|
| `x3a` | : | `x3b` | ; | `x3c` | < | `x3d` | = |
| `x3e` | > | `x3f` | ? | `x40` | @ |

#### Uppercase Letters (A-Z)

| HEX | ASCII | HEX | ASCII | HEX | ASCII | HEX | ASCII |
|-----|-------|-----|-------|-----|-------|-----|-------|
| `x41` | A | `x42` | B | `x43` | C | `x44` | D |
| `x45` | E | `x46` | F | `x47` | G | `x48` | H |
| `x49` | I | `x4a` | J | `x4b` | K | `x4c` | L |
| `x4d` | M | `x4e` | N | `x4f` | O | `x50` | P |
| `x51` | Q | `x52` | R | `x53` | S | `x54` | T |
| `x55` | U | `x56` | V | `x57` | W | `x58` | X |
| `x59` | Y | `x5a` | Z |

#### More Special Characters

| HEX | ASCII | HEX | ASCII | HEX | ASCII | HEX | ASCII |
|-----|-------|-----|-------|-----|-------|-----|-------|
| `x5b` | [ | `x5c` | \ | `x5d` | ] | `x5e` | ^ |
| `x5f` | _ | `x60` | ` |

#### Lowercase Letters (a-z)

| HEX | ASCII | HEX | ASCII | HEX | ASCII | HEX | ASCII |
|-----|-------|-----|-------|-----|-------|-----|-------|
| `x61` | a | `x62` | b | `x63` | c | `x64` | d |
| `x65` | e | `x66` | f | `x67` | g | `x68` | h |
| `x69` | i | `x6a` | j | `x6b` | k | `x6c` | l |
| `x6d` | m | `x6e` | n | `x6f` | o | `x70` | p |
| `x71` | q | `x72` | r | `x73` | s | `x74` | t |
| `x75` | u | `x76` | v | `x77` | w | `x78` | x |
| `x79` | y | `x7a` | z |

#### Final Special Characters

| HEX | ASCII | HEX | ASCII | HEX | ASCII | HEX | ASCII |
|-----|-------|-----|-------|-----|-------|-----|-------|
| `x7b` | { | `x7c` | \| | `x7d` | } | `x7e` | ~ |

---

## Quick Reference

### ASCII Decimal to Hex Conversion

```
Dec  Hex  Char    Dec  Hex  Char    Dec  Hex  Char    Dec  Hex  Char
---  ---  ----    ---  ---  ----    ---  ---  ----    ---  ---  ----
 32  x20  Space    48  x30   0       64  x40   @       80  x50   P
 33  x21   !       49  x31   1       65  x41   A       81  x51   Q
 34  x22   "       50  x32   2       66  x42   B       82  x52   R
 35  x23   #       51  x33   3       67  x43   C       83  x53   S
 36  x24   $       52  x34   4       68  x44   D       84  x54   T
 37  x25   %       53  x35   5       69  x45   E       85  x55   U
 38  x26   &       54  x36   6       70  x46   F       86  x56   V
 39  x27   '       55  x37   7       71  x47   G       87  x57   W
 40  x28   (       56  x38   8       72  x48   H       88  x58   X
 41  x29   )       57  x39   9       73  x49   I       89  x59   Y
 42  x2a   *       58  x3a   :       74  x4a   J       90  x5a   Z
 43  x2b   +       59  x3b   ;       75  x4b   K       97  x61   a
 44  x2c   ,       60  x3c   <       76  x4c   L       98  x62   b
 45  x2d   -       61  x3d   =       77  x4d   M       99  x63   c
 46  x2e   .       62  x3e   >       78  x4e   N      122  x7a   z
 47  x2f   /       63  x3f   ?       79  x4f   O
```

### Common Escape Sequences

| Escape | Description |
|--------|-------------|
| `\n` | Newline (LF) |
| `\r` | Carriage return (CR) |
| `\t` | Horizontal tab |
| `\v` | Vertical tab |
| `\f` | Form feed |
| `\b` | Backspace |
| `\\` | Backslash |
| `\'` | Single quote |
| `\"` | Double quote |
| `\0` | Null character |

---

## Usage in Programming Languages

### Python
```python
import re

# Match pattern
pattern = r'\d{3}-\d{3}-\d{4}'
text = "Call me at 555-123-4567"
match = re.search(pattern, text)

# Find all matches
matches = re.findall(r'\b[A-Z]\w+', text)

# Replace pattern
new_text = re.sub(r'\d+', 'XXX', text)
```

### Bash/Grep
```bash
# Match lines starting with 'Error'
grep '^Error' logfile.txt

# Match email addresses
grep -E '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' file.txt

# Match IP addresses
grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' file.txt
```

### PowerShell
```powershell
# Match pattern
$text = "Server IP: 192.168.1.100"
$text -match '\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}'

# Replace pattern
$text -replace '\d+', 'XXX'

# Select-String for file searching
Select-String -Path "*.log" -Pattern "Error|Warning"
```

---

## Best Practices

1. **Use Raw Strings**: In Python, use `r''` for regex patterns to avoid escaping issues
2. **Test Your Patterns**: Use online regex testers like regex101.com
3. **Be Specific**: Avoid overly greedy patterns that match too much
4. **Use Non-Capturing Groups**: Use `(?:...)` when you don't need to capture the group
5. **Optimize Performance**: Place common patterns first in alternations
6. **Comment Complex Patterns**: Use verbose mode in Python for readability
7. **Validate Input**: Always validate and sanitize user input before regex matching

---

## Security Considerations

**WARNING**: Regular expressions can be vulnerable to:

- **ReDoS (Regular Expression Denial of Service)**: Malicious input can cause exponential backtracking
- **Injection Attacks**: Never use untrusted input directly in regex patterns
- **Information Disclosure**: Poorly designed patterns may reveal sensitive data

**Best Practices**:
- Set timeouts for regex operations
- Validate input length before matching
- Use anchor points (`^` and `$`) to prevent unexpected matches
- Test patterns with malicious input
- Avoid nested quantifiers like `(a+)+`

---

## Additional Resources

- **Online Tools**:
  - regex101.com - Interactive regex tester with explanations
  - regexr.com - Visual regex testing
  - regexper.com - Regex visualization

- **Documentation**:
  - Python `re` module: https://docs.python.org/3/library/re.html
  - PCRE (Perl Compatible Regular Expressions)
  - JavaScript RegExp: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
