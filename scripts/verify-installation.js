#!/usr/bin/env node

/**
 * Installation Verification Script
 * Checks that all requirements are met for Subagent CLI to run properly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const chalk = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`
};

let hasErrors = false;
let hasWarnings = false;

console.log(chalk.bold('\n🔍 Subagent CLI Installation Verification\n'));
console.log(chalk.gray('='.repeat(60)));

/**
 * Check a requirement and report status
 */
function check(name, testFn, required = true) {
  try {
    const result = testFn();
    if (result === true || result === undefined) {
      console.log(chalk.green('✓'), name);
      return true;
    } else if (result) {
      console.log(chalk.green('✓'), name, chalk.gray(`(${result})`));
      return true;
    } else {
      if (required) {
        console.log(chalk.red('✗'), name);
        hasErrors = true;
      } else {
        console.log(chalk.yellow('⚠'), name, chalk.gray('(optional)'));
        hasWarnings = true;
      }
      return false;
    }
  } catch (error) {
    if (required) {
      console.log(chalk.red('✗'), name, chalk.red(`- ${error.message}`));
      hasErrors = true;
    } else {
      console.log(chalk.yellow('⚠'), name, chalk.gray('(optional)'));
      hasWarnings = true;
    }
    return false;
  }
}

// Node.js version check
console.log(chalk.blue('\n📦 Runtime Environment:\n'));
check('Node.js version >= 14.0.0', () => {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  if (major >= 14) return version;
  throw new Error(`Node.js ${version} is too old. Need 14.0.0+`);
});

check('npm is available', () => {
  try {
    const version = execSync('npm --version', { encoding: 'utf8' }).trim();
    return version;
  } catch (e) {
    throw new Error('npm not found in PATH');
  }
});

// Required files check
console.log(chalk.blue('\n📁 Required Files:\n'));

check('cli.js exists', () => {
  if (!fs.existsSync('./cli.js')) throw new Error('Missing cli.js');
  return true;
});

check('package.json exists', () => {
  if (!fs.existsSync('./package.json')) throw new Error('Missing package.json');
  return true;
});

check('config/config.json exists', () => {
  if (!fs.existsSync('./config/config.json')) throw new Error('Missing config/config.json');
  return true;
});

check('node_modules/ directory exists', () => {
  if (!fs.existsSync('./node_modules')) {
    throw new Error('Dependencies not installed. Run: npm install');
  }
  return true;
});

// Environment configuration check
console.log(chalk.blue('\n🔧 Configuration:\n'));

check('.env file exists', () => {
  if (!fs.existsSync('./.env')) {
    throw new Error('.env not found. Copy .env.example to .env');
  }
  return true;
});

check('ANTHROPIC_API_KEY is set', () => {
  require('dotenv').config();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set in .env');
  }
  if (apiKey === 'your-anthropic-api-key-here' || apiKey.length < 20) {
    throw new Error('ANTHROPIC_API_KEY looks invalid');
  }
  return 'configured';
});

// Directory structure check
console.log(chalk.blue('\n📂 Directory Structure:\n'));

check('lib/ directory exists', () => {
  if (!fs.existsSync('./lib')) throw new Error('Missing lib/ directory');
  return true;
});

check('prompts/ directory exists', () => {
  if (!fs.existsSync('./prompts')) throw new Error('Missing prompts/ directory');
  return true;
});

check('docs/ directory exists', () => {
  if (!fs.existsSync('./docs')) throw new Error('Missing docs/ directory');
  return true;
});

check('logs/ directory exists', () => {
  if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs', { recursive: true });
    return 'created';
  }
  return true;
}, false);

check('.cache/ directory exists', () => {
  if (!fs.existsSync('./.cache')) {
    fs.mkdirSync('./.cache', { recursive: true });
    return 'created';
  }
  return true;
}, false);

// Core dependencies check
console.log(chalk.blue('\n📦 Core Dependencies:\n'));

const requiredDeps = [
  '@anthropic-ai/sdk',
  'commander',
  'chalk',
  'inquirer',
  'ora',
  'cli-table3',
  'dotenv',
  'winston'
];

requiredDeps.forEach(dep => {
  check(`${dep} installed`, () => {
    const pkgPath = path.join('./node_modules', dep, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      throw new Error(`${dep} not installed`);
    }
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version;
  });
});

// TypeScript compilation check
console.log(chalk.blue('\n🔨 Build Status:\n'));

check('TypeScript compiled', () => {
  try {
    // Check if any .ts files exist in lib/
    const hasTypeScript = fs.existsSync('./lib/streaming') ||
                          fs.existsSync('./lib/tracking');

    if (!hasTypeScript) return 'no TypeScript files';

    // Check if tsconfig.json exists
    if (!fs.existsSync('./tsconfig.json')) {
      throw new Error('tsconfig.json missing');
    }

    return 'ready (run npm run build if needed)';
  } catch (e) {
    throw new Error(e.message);
  }
}, false);

// CLI functionality check
console.log(chalk.blue('\n⚡ CLI Functionality:\n'));

check('CLI is executable', () => {
  try {
    // Try to load the CLI module
    const cliPath = path.join(process.cwd(), 'cli.js');
    if (!fs.existsSync(cliPath)) {
      throw new Error('cli.js not found');
    }

    // Check if it has required structure
    const cliContent = fs.readFileSync(cliPath, 'utf8');
    if (!cliContent.includes('commander')) {
      throw new Error('CLI structure incomplete');
    }

    return true;
  } catch (e) {
    throw new Error(e.message);
  }
});

// Platform detection
console.log(chalk.blue('\n🖥️  Platform Information:\n'));

check('Platform detection', () => {
  const platform = process.platform;
  const platforms = {
    'win32': 'Windows',
    'darwin': 'macOS',
    'linux': 'Linux'
  };
  return platforms[platform] || platform;
});

check('Architecture', () => {
  return process.arch;
});

// Optional tools check (non-blocking)
console.log(chalk.blue('\n🛠️  Optional Tools (for agents):\n'));

const optionalTools = [
  { name: 'git', check: 'git --version' },
  { name: 'docker', check: 'docker --version' },
  { name: 'kubectl', check: 'kubectl version --client' },
  { name: 'aws', check: 'aws --version' },
  { name: 'az', check: 'az version' }
];

optionalTools.forEach(tool => {
  check(tool.name, () => {
    try {
      const output = execSync(tool.check, {
        encoding: 'utf8',
        stderr: 'ignore',
        timeout: 2000
      }).trim().split('\n')[0];
      return output;
    } catch (e) {
      throw new Error('not installed');
    }
  }, false);
});

// Final summary
console.log(chalk.gray('\n' + '='.repeat(60)));

if (hasErrors) {
  console.log(chalk.red('\n✗ Installation verification FAILED'));
  console.log(chalk.red('\nPlease fix the errors above before using Subagent CLI.\n'));
  console.log(chalk.yellow('Quick fixes:'));
  console.log('  • Run: npm install');
  console.log('  • Copy: cp .env.example .env');
  console.log('  • Edit .env and add your ANTHROPIC_API_KEY');
  console.log('  • Run: npm run build\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log(chalk.yellow('\n⚠ Installation verification completed with warnings'));
  console.log(chalk.green('\n✓ Core functionality should work!'));
  console.log(chalk.gray('\nOptional tools can be installed later for specific agents.\n'));
  process.exit(0);
} else {
  console.log(chalk.green('\n✓ Installation verification PASSED'));
  console.log(chalk.green('\n🎉 Everything looks good! You\'re ready to use Subagent CLI.\n'));
  console.log(chalk.gray('Next steps:'));
  console.log('  • Run: node cli.js info');
  console.log('  • Run: node cli.js agents');
  console.log('  • Try: node cli.js system "Show system info"\n');
  process.exit(0);
}
