#!/bin/bash

# Development Setup Script
# Prepares the development environment for Subagent CLI

set -e  # Exit on error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🛠️  Subagent CLI - Development Setup"
echo "===================================="
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node --version)
REQUIRED_VERSION="v14.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js $REQUIRED_VERSION or higher is required"
    echo "   Current version: $NODE_VERSION"
    exit 1
fi

echo "✅ Node.js $NODE_VERSION (OK)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
cd "$PROJECT_ROOT"

if [ -d "node_modules" ]; then
    echo "⚠️  node_modules already exists. Cleaning..."
    rm -rf node_modules package-lock.json
fi

npm install

echo "✅ Dependencies installed"
echo ""

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

echo "✅ TypeScript compiled"
echo ""

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ Created .env file (please add your ANTHROPIC_API_KEY)"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your API key:"
    echo "   ANTHROPIC_API_KEY=your-key-here"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Create necessary directories
echo "📁 Creating required directories..."
mkdir -p logs
mkdir -p .cache
echo "✅ Directories created"
echo ""

# Run verification
echo "🔍 Running verification..."
npm run verify

echo ""
echo "🎉 Development setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env and add your ANTHROPIC_API_KEY"
echo "  2. Run: npm run info (to test CLI)"
echo "  3. Run: npm run agents (to see available agents)"
echo "  4. Start developing!"
echo ""
