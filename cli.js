#!/usr/bin/env node

/**
 * Subagent CLI - Enterprise AI Agent Framework
 * Main CLI entry point
 */

const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const path = require('path');
const PlatformDetector = require('./lib/platform-detector');
const AgentBase = require('./lib/agent-base');

const program = new Command();
const platform = new PlatformDetector();

// Load configuration
const configPath = path.join(__dirname, 'config', 'config.json');
let config = {};
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error(chalk.red('Error loading configuration:', error.message));
  process.exit(1);
}

// CLI Metadata
program
  .name('subagent-cli')
  .description('Enterprise AI Agent CLI Framework with maximum tool integration')
  .version('1.0.0');

// Global options
program
  .option('-p, --platform <platform>', 'Platform override (windows, macos, linux)', config.platform)
  .option('-s, --shell <shell>', 'Shell override (bash, powershell, zsh)', config.defaultShell)
  .option('-v, --verbose', 'Verbose output', config.output.verbose)
  .option('--no-color', 'Disable colored output')
  .option('-c, --config <path>', 'Custom config file path', configPath);

// Info command
program
  .command('info')
  .description('Display system and platform information')
  .action(async () => {
    const spinner = ora('Gathering system information...').start();

    try {
      const info = platform.getPlatformInfo();

      spinner.succeed('System information retrieved');

      console.log(chalk.bold('\n=== Platform Information ==='));
      console.log(chalk.cyan('Platform:'), info.platform);
      console.log(chalk.cyan('Architecture:'), info.architecture);
      console.log(chalk.cyan('OS Type:'), info.osType);
      console.log(chalk.cyan('OS Release:'), info.osRelease);
      console.log(chalk.cyan('Hostname:'), info.hostname);

      console.log(chalk.bold('\n=== Hardware ==='));
      console.log(chalk.cyan('CPUs:'), info.cpus);
      console.log(chalk.cyan('Total Memory:'), `${(info.totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`);
      console.log(chalk.cyan('Free Memory:'), `${(info.freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB`);

      console.log(chalk.bold('\n=== Available Shells ==='));
      info.availableShells.forEach(shell => {
        console.log(chalk.cyan(`  ${shell.name}:`), shell.fullName, chalk.gray(`(${shell.version})`));
      });

      console.log(chalk.bold('\n=== Default Shell ==='));
      console.log(chalk.green(`  ${info.defaultShell.name}:`), info.defaultShell.fullName);
    } catch (error) {
      spinner.fail('Failed to retrieve system information');
      console.error(chalk.red('Error:', error.message));
      process.exit(1);
    }
  });

// List agents command
program
  .command('agents')
  .description('List available agents')
  .action(() => {
    console.log(chalk.bold('\n=== Available Agents ===\n'));

    Object.entries(config.agents).forEach(([name, agentConfig]) => {
      const status = agentConfig.enabled ? chalk.green('✓ enabled') : chalk.red('✗ disabled');
      console.log(chalk.bold(name), status);
      console.log(chalk.gray(`  ${agentConfig.description}`));
      console.log('');
    });
  });

// DevOps agent command
program
  .command('devops <task>')
  .description('Execute DevOps task')
  .action(async (task) => {
    await executeAgent('devops', task);
  });

// Cloud agent command
program
  .command('cloud <task>')
  .description('Execute cloud infrastructure task')
  .action(async (task) => {
    await executeAgent('cloud', task);
  });

// Security agent command
program
  .command('security <task>')
  .description('Execute security task')
  .action(async (task) => {
    await executeAgent('security', task);
  });

// Data agent command
program
  .command('data <task>')
  .description('Execute data engineering task')
  .action(async (task) => {
    await executeAgent('data', task);
  });

// System agent command
program
  .command('system <task>')
  .description('Execute system administration task')
  .action(async (task) => {
    await executeAgent('system', task);
  });

// Code agent command
program
  .command('code <task>')
  .description('Execute code development task')
  .action(async (task) => {
    await executeAgent('code', task);
  });

// Interactive mode
program
  .command('interactive')
  .alias('i')
  .description('Start interactive mode')
  .action(async () => {
    const inquirer = require('inquirer');

    console.log(chalk.bold('\n=== Subagent CLI Interactive Mode ===\n'));

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'agent',
        message: 'Select an agent:',
        choices: Object.keys(config.agents).filter(name => config.agents[name].enabled)
      },
      {
        type: 'input',
        name: 'task',
        message: 'Enter your task:',
        validate: (input) => input.length > 0 || 'Task cannot be empty'
      }
    ]);

    await executeAgent(answers.agent, answers.task);
  });

// Tools command
program
  .command('tools')
  .description('List available tools')
  .option('-c, --category <category>', 'Filter by category')
  .action(async (options) => {
    const registryPath = path.join(__dirname, 'tools', 'registry.json');

    try {
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

      console.log(chalk.bold('\n=== Available Tools ===\n'));

      let tools = registry.tools;

      if (options.category) {
        tools = tools.filter(t => t.category === options.category);
      }

      // Group by category
      const byCategory = {};
      tools.forEach(tool => {
        if (!byCategory[tool.category]) {
          byCategory[tool.category] = [];
        }
        byCategory[tool.category].push(tool);
      });

      Object.entries(byCategory).forEach(([category, categoryTools]) => {
        console.log(chalk.bold.cyan(`\n${category.toUpperCase()}`));
        categoryTools.forEach(tool => {
          const platforms = tool.platforms.join(', ');
          console.log(chalk.yellow(`  ${tool.name}`) + chalk.gray(` (${platforms})`));
          console.log(chalk.gray(`    ${tool.description}`));
        });
      });

      console.log(chalk.gray(`\n\nTotal tools: ${tools.length}`));
    } catch (error) {
      console.error(chalk.red('Error loading tool registry:', error.message));
      process.exit(1);
    }
  });

/**
 * Execute an agent with a task
 */
async function executeAgent(agentType, task) {
  const spinner = ora(`Initializing ${agentType} agent...`).start();

  try {
    // Check if agent is enabled
    if (!config.agents[agentType] || !config.agents[agentType].enabled) {
      spinner.fail(`Agent '${agentType}' is not enabled`);
      process.exit(1);
    }

    // Create agent instance
    const agent = new AgentBase({
      name: `${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Agent`,
      type: agentType
    });

    spinner.text = `Loading ${agentType} agent...`;
    await agent.initialize();

    spinner.succeed(`${agentType} agent initialized`);

    console.log(chalk.bold(`\nTask: ${task}\n`));

    spinner.start('Executing task...');

    // Execute the task
    const result = await agent.execute(task);

    if (result.success) {
      spinner.succeed('Task completed successfully');
      console.log(chalk.green('\n=== Result ==='));
      console.log(result.summary);
    } else {
      spinner.fail('Task failed');
      console.log(chalk.red('\n=== Error ==='));
      console.log(result.error || 'Unknown error');
    }

    // Show agent stats
    const stats = agent.executor.getStats();
    console.log(chalk.gray(`\n=== Execution Stats ===`));
    console.log(chalk.gray(`Total commands: ${stats.total}`));
    console.log(chalk.gray(`Success rate: ${stats.successRate.toFixed(2)}%`));
    console.log(chalk.gray(`Average duration: ${stats.avgDuration}ms`));
  } catch (error) {
    spinner.fail('Agent execution failed');
    console.error(chalk.red('Error:', error.message));

    if (program.opts().verbose) {
      console.error(chalk.gray('\nStack trace:'));
      console.error(chalk.gray(error.stack));
    }

    process.exit(1);
  }
}

// Parse arguments
program.parse(process.argv);

// Show help if no command specified
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
