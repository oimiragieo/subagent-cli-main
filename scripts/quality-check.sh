#!/bin/bash

# Code Quality Check Script
# Runs all quality checks before committing

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "🔍 Subagent CLI - Code Quality Checks"
echo "======================================"
echo ""

FAILURES=0

# Function to run a check
run_check() {
    local name="$1"
    local command="$2"

    echo "Running: $name..."
    if eval "$command" > /dev/null 2>&1; then
        echo "✅ $name passed"
        return 0
    else
        echo "❌ $name failed"
        FAILURES=$((FAILURES + 1))
        return 1
    fi
}

# 1. Check if dependencies are installed
echo "1️⃣  Dependencies Check"
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Run: npm install"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# 2. TypeScript compilation
echo "2️⃣  TypeScript Compilation"
run_check "TypeScript compilation" "npm run build"
echo ""

# 3. Linting
echo "3️⃣  Code Linting"
if command -v eslint &> /dev/null; then
    run_check "ESLint" "npm run lint"
else
    echo "⚠️  ESLint not available, skipping"
fi
echo ""

# 4. Formatting
echo "4️⃣  Code Formatting"
if command -v prettier &> /dev/null; then
    run_check "Prettier check" "npm run format -- --check"
else
    echo "⚠️  Prettier not available, skipping"
fi
echo ""

# 5. Configuration validation
echo "5️⃣  Configuration Validation"
if python3 -c "import json; json.load(open('config/config.json'))" 2>/dev/null; then
    echo "✅ config.json is valid JSON"
else
    echo "❌ config.json is invalid JSON"
    FAILURES=$((FAILURES + 1))
fi

if python3 -c "import json; json.load(open('tools/registry.json'))" 2>/dev/null; then
    echo "✅ tools/registry.json is valid JSON"
else
    echo "❌ tools/registry.json is invalid JSON"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# 6. Required files check
echo "6️⃣  Required Files Check"
REQUIRED_FILES=(
    "README.md"
    "QUICKSTART.md"
    "CONTRIBUTING.md"
    ".env.example"
    "config/config.example.json"
    "cli.js"
    "package.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        FAILURES=$((FAILURES + 1))
    fi
done
echo ""

# 7. Verification script
echo "7️⃣  Installation Verification"
if [ -f ".env" ]; then
    echo "⚠️  Skipping npm run verify (would need API key)"
else
    echo "⚠️  No .env file, skipping verification"
fi
echo ""

# Summary
echo "========================================"
if [ $FAILURES -eq 0 ]; then
    echo "✅ All checks passed!"
    echo ""
    echo "Ready to commit! 🎉"
    exit 0
else
    echo "❌ $FAILURES check(s) failed"
    echo ""
    echo "Please fix the issues before committing."
    exit 1
fi
