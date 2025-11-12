/**
 * PowerShell Integration Module
 * Provides PowerShell-specific tool integrations and helpers
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class PowerShellIntegration {
  constructor() {
    this.shell = 'powershell';
    this.encoding = 'utf8';
  }

  /**
   * Execute PowerShell command
   * @param {string} command PowerShell command
   * @param {Object} options Execution options
   * @returns {Promise<Object>} Command result
   */
  async execute(command, options = {}) {
    const escapedCommand = command.replace(/"/g, '\\"');
    const psCommand = `powershell -NoProfile -NonInteractive -Command "${escapedCommand}"`;

    try {
      const { stdout, stderr } = await execPromise(psCommand, {
        encoding: this.encoding,
        maxBuffer: options.maxBuffer || 10 * 1024 * 1024,
        timeout: options.timeout || 300000,
        ...options
      });

      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0
      };
    } catch (error) {
      return {
        success: false,
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.code || 1,
        error: error.message
      };
    }
  }

  /**
   * Execute PowerShell script from file
   * @param {string} scriptPath Path to .ps1 file
   * @param {Array} parameters Script parameters
   * @returns {Promise<Object>} Execution result
   */
  async executeScript(scriptPath, parameters = []) {
    const params = parameters.map(p => `'${p}'`).join(' ');
    const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" ${params}`;

    try {
      const { stdout, stderr } = await execPromise(command);
      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0
      };
    } catch (error) {
      return {
        success: false,
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.code || 1,
        error: error.message
      };
    }
  }

  /**
   * Get system information using PowerShell
   * @returns {Promise<Object>} System information
   */
  async getSystemInfo() {
    const command = `
      $info = @{
        ComputerName = $env:COMPUTERNAME
        OSVersion = [System.Environment]::OSVersion.VersionString
        PowerShellVersion = $PSVersionTable.PSVersion.ToString()
        DotNetVersion = [System.Runtime.InteropServices.RuntimeInformation]::FrameworkDescription
        Processors = (Get-CimInstance Win32_Processor).NumberOfLogicalProcessors
        TotalMemoryGB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
        Architecture = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture
      }
      $info | ConvertTo-Json
    `;

    const result = await this.execute(command);
    if (result.success) {
      try {
        return JSON.parse(result.stdout);
      } catch (e) {
        return { error: 'Failed to parse system info' };
      }
    }
    return result;
  }

  /**
   * Get running services
   * @returns {Promise<Array>} List of services
   */
  async getServices() {
    const command = 'Get-Service | Select-Object Name, Status, StartType | ConvertTo-Json';
    const result = await this.execute(command);

    if (result.success) {
      try {
        return JSON.parse(result.stdout);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  /**
   * Get running processes
   * @param {number} limit Number of processes to return
   * @returns {Promise<Array>} List of processes
   */
  async getProcesses(limit = 10) {
    const command = `Get-Process | Sort-Object CPU -Descending | Select-Object -First ${limit} Name, Id, CPU, WorkingSet | ConvertTo-Json`;
    const result = await this.execute(command);

    if (result.success) {
      try {
        return JSON.parse(result.stdout);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  /**
   * Get disk usage
   * @returns {Promise<Array>} Disk information
   */
  async getDiskUsage() {
    const command = 'Get-PSDrive -PSProvider FileSystem | Select-Object Name, Used, Free, @{Name="Total";Expression={$_.Used + $_.Free}} | ConvertTo-Json';
    const result = await this.execute(command);

    if (result.success) {
      try {
        return JSON.parse(result.stdout);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  /**
   * Get network adapters
   * @returns {Promise<Array>} Network adapter information
   */
  async getNetworkAdapters() {
    const command = 'Get-NetAdapter | Select-Object Name, Status, LinkSpeed, MacAddress | ConvertTo-Json';
    const result = await this.execute(command);

    if (result.success) {
      try {
        return JSON.parse(result.stdout);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  /**
   * Get event logs
   * @param {string} logName Log name (System, Application, Security)
   * @param {number} count Number of entries
   * @returns {Promise<Array>} Event log entries
   */
  async getEventLogs(logName = 'System', count = 100) {
    const command = `Get-EventLog -LogName ${logName} -Newest ${count} | Select-Object TimeGenerated, EntryType, Source, Message | ConvertTo-Json`;
    const result = await this.execute(command);

    if (result.success) {
      try {
        return JSON.parse(result.stdout);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  /**
   * Test network connection
   * @param {string} computerName Computer or IP to test
   * @param {number} port Port number
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection(computerName, port = null) {
    const portParam = port ? `-Port ${port}` : '';
    const command = `Test-NetConnection -ComputerName ${computerName} ${portParam} | ConvertTo-Json`;
    const result = await this.execute(command);

    if (result.success) {
      try {
        return JSON.parse(result.stdout);
      } catch (e) {
        return { error: 'Failed to parse connection test' };
      }
    }
    return result;
  }

  /**
   * Get environment variables
   * @returns {Promise<Object>} Environment variables
   */
  async getEnvironmentVariables() {
    const command = 'Get-ChildItem Env: | Select-Object Name, Value | ConvertTo-Json';
    const result = await this.execute(command);

    if (result.success) {
      try {
        const envVars = JSON.parse(result.stdout);
        return envVars.reduce((acc, { Name, Value }) => {
          acc[Name] = Value;
          return acc;
        }, {});
      } catch (e) {
        return {};
      }
    }
    return {};
  }

  /**
   * Check if PowerShell Core (pwsh) is available
   * @returns {Promise<boolean>} True if pwsh is available
   */
  async isPowerShellCoreAvailable() {
    try {
      await execPromise('pwsh -Command "Write-Output test"');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Use PowerShell Core if available, otherwise Windows PowerShell
   * @param {string} command Command to execute
   * @returns {Promise<Object>} Command result
   */
  async executeBestShell(command) {
    const hasPwsh = await this.isPowerShellCoreAvailable();
    const shell = hasPwsh ? 'pwsh' : 'powershell';

    const escapedCommand = command.replace(/"/g, '\\"');
    const psCommand = `${shell} -NoProfile -NonInteractive -Command "${escapedCommand}"`;

    try {
      const { stdout, stderr } = await execPromise(psCommand);
      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0,
        shell
      };
    } catch (error) {
      return {
        success: false,
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.code || 1,
        error: error.message,
        shell
      };
    }
  }
}

module.exports = PowerShellIntegration;
