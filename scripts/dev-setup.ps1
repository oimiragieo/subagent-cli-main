# PowerShell Development Setup Script
# Prepares the development environment for Subagent CLI on Windows

Write-Host "🛠️  Subagent CLI - Development Setup (Windows)" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "📦 Checking Node.js version..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion (OK)" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 14.0.0 or higher" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Push-Location $ProjectRoot

if (Test-Path "node_modules") {
    Write-Host "⚠️  node_modules already exists. Cleaning..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
}

npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Build TypeScript
Write-Host "🔨 Building TypeScript..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript build failed" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "✅ TypeScript compiled" -ForegroundColor Green
Write-Host ""

# Create .env if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env and add your API key:" -ForegroundColor Yellow
    Write-Host "   ANTHROPIC_API_KEY=your-key-here" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
    Write-Host ""
}

# Create necessary directories
Write-Host "📁 Creating required directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path logs, .cache | Out-Null
Write-Host "✅ Directories created" -ForegroundColor Green
Write-Host ""

# Run verification
Write-Host "🔍 Running verification..." -ForegroundColor Yellow
npm run verify

Pop-Location

Write-Host ""
Write-Host "🎉 Development setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Edit .env and add your ANTHROPIC_API_KEY" -ForegroundColor White
Write-Host "  2. Run: npm run info (to test CLI)" -ForegroundColor White
Write-Host "  3. Run: npm run agents (to see available agents)" -ForegroundColor White
Write-Host "  4. Start developing!" -ForegroundColor White
Write-Host ""
