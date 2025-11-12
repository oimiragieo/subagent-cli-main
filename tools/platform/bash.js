/**
 * Bash Integration Module
 * Provides Bash-specific tool integrations and helpers for Unix-like systems
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class BashIntegration {
  constructor() {
    this.shell = 'bash';
    this.encoding = 'utf8';
  }

  /**
   * Execute Bash command
   * @param {string} command Bash command
   * @param {Object} options Execution options
   * @returns {Promise<Object>} Command result
   */
  async execute(command, options = {}) {
    try {
      const { stdout, stderr } = await execPromise(command, {
        shell: '/bin/bash',
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
   * Execute Bash script from file
   * @param {string} scriptPath Path to .sh file
   * @param {Array} parameters Script parameters
   * @returns {Promise<Object>} Execution result
   */
  async executeScript(scriptPath, parameters = []) {
    const params = parameters.map(p => `'${p}'`).join(' ');
    const command = `bash "${scriptPath}" ${params}`;

    return this.execute(command);
  }

  /**
   * Get system information
   * @returns {Promise<Object>} System information
   */
  async getSystemInfo() {
    const commands = {
      hostname: 'hostname',
      os: 'uname -s',
      kernel: 'uname -r',
      architecture: 'uname -m',
      cpuModel: 'grep "model name" /proc/cpuinfo | head -1 | cut -d ":" -f2 | xargs',
      cpuCores: 'nproc',
      totalMemoryMB: 'free -m | grep Mem | awk \'{print $2}\'',
      uptime: 'uptime -p'
    };

    const info = {};

    for (const [key, cmd] of Object.entries(commands)) {
      const result = await this.execute(cmd);
      if (result.success) {
        info[key] = result.stdout;
      } else {
        info[key] = 'N/A';
      }
    }

    return info;
  }

  /**
   * Get running services (systemd)
   * @returns {Promise<Array>} List of services
   */
  async getServices() {
    const command = 'systemctl list-units --type=service --state=running --no-pager --no-legend | awk \'{print $1}\'';
    const result = await this.execute(command);

    if (result.success) {
      return result.stdout.split('\n').filter(s => s.length > 0);
    }
    return [];
  }

  /**
   * Get service status
   * @param {string} serviceName Service name
   * @returns {Promise<Object>} Service status
   */
  async getServiceStatus(serviceName) {
    const command = `systemctl is-active ${serviceName}`;
    const result = await this.execute(command);

    return {
      name: serviceName,
      active: result.stdout === 'active',
      status: result.stdout
    };
  }

  /**
   * Get running processes
   * @param {number} limit Number of processes to return
   * @returns {Promise<Array>} List of processes
   */
  async getProcesses(limit = 10) {
    const command = `ps aux --sort=-%cpu | head -${limit + 1} | tail -${limit} | awk '{print $2,$3,$4,$11}'`;
    const result = await this.execute(command);

    if (result.success) {
      return result.stdout.split('\n').map(line => {
        const [pid, cpu, mem, command] = line.split(/\s+/);
        return { pid, cpu, mem, command };
      });
    }
    return [];
  }

  /**
   * Get disk usage
   * @returns {Promise<Array>} Disk information
   */
  async getDiskUsage() {
    const command = 'df -h | tail -n +2';
    const result = await this.execute(command);

    if (result.success) {
      return result.stdout.split('\n').map(line => {
        const parts = line.split(/\s+/);
        return {
          filesystem: parts[0],
          size: parts[1],
          used: parts[2],
          available: parts[3],
          usePercent: parts[4],
          mountPoint: parts[5]
        };
      });
    }
    return [];
  }

  /**
   * Get memory usage
   * @returns {Promise<Object>} Memory information
   */
  async getMemoryUsage() {
    const command = 'free -m';
    const result = await this.execute(command);

    if (result.success) {
      const lines = result.stdout.split('\n');
      const memLine = lines[1].split(/\s+/);

      return {
        total: parseInt(memLine[1]),
        used: parseInt(memLine[2]),
        free: parseInt(memLine[3]),
        shared: parseInt(memLine[4]),
        cached: parseInt(memLine[5]),
        available: parseInt(memLine[6]),
        unit: 'MB'
      };
    }
    return {};
  }

  /**
   * Get network interfaces
   * @returns {Promise<Array>} Network interface information
   */
  async getNetworkInterfaces() {
    const command = 'ip -o addr show | awk \'{print $2,$3,$4}\'';
    const result = await this.execute(command);

    if (result.success) {
      return result.stdout.split('\n').map(line => {
        const [iface, family, address] = line.split(/\s+/);
        return { interface: iface, family, address };
      });
    }
    return [];
  }

  /**
   * Get listening ports
   * @returns {Promise<Array>} Listening ports
   */
  async getListeningPorts() {
    const command = 'ss -tuln | tail -n +2';
    const result = await this.execute(command);

    if (result.success) {
      return result.stdout.split('\n').filter(l => l.length > 0).map(line => {
        const parts = line.split(/\s+/);
        return {
          protocol: parts[0],
          state: parts[1],
          localAddress: parts[4],
          peerAddress: parts[5]
        };
      });
    }
    return [];
  }

  /**
   * Get system logs (last N lines)
   * @param {number} lines Number of lines to retrieve
   * @returns {Promise<Array>} Log entries
   */
  async getSystemLogs(lines = 100) {
    // Try journalctl first (systemd), fallback to syslog
    let command = `journalctl -n ${lines} --no-pager`;
    let result = await this.execute(command);

    if (!result.success) {
      command = `tail -n ${lines} /var/log/syslog`;
      result = await this.execute(command);
    }

    if (result.success) {
      return result.stdout.split('\n');
    }
    return [];
  }

  /**
   * Search logs for pattern
   * @param {string} pattern Search pattern
   * @param {string} logFile Log file path (optional)
   * @returns {Promise<Array>} Matching log entries
   */
  async searchLogs(pattern, logFile = null) {
    let command;

    if (logFile) {
      command = `grep -i "${pattern}" ${logFile}`;
    } else {
      command = `journalctl --no-pager | grep -i "${pattern}"`;
    }

    const result = await this.execute(command);

    if (result.success) {
      return result.stdout.split('\n').filter(l => l.length > 0);
    }
    return [];
  }

  /**
   * Get CPU usage
   * @returns {Promise<Object>} CPU usage information
   */
  async getCPUUsage() {
    const command = 'top -bn1 | grep "Cpu(s)" | awk \'{print $2,$4,$6,$8}\'';
    const result = await this.execute(command);

    if (result.success) {
      const [us, sy, ni, id] = result.stdout.split(/\s+/);
      return {
        user: parseFloat(us),
        system: parseFloat(sy),
        nice: parseFloat(ni),
        idle: parseFloat(id)
      };
    }
    return {};
  }

  /**
   * Get load average
   * @returns {Promise<Object>} Load average
   */
  async getLoadAverage() {
    const command = 'cat /proc/loadavg';
    const result = await this.execute(command);

    if (result.success) {
      const [one, five, fifteen] = result.stdout.split(/\s+/);
      return {
        '1min': parseFloat(one),
        '5min': parseFloat(five),
        '15min': parseFloat(fifteen)
      };
    }
    return {};
  }

  /**
   * Check if a package is installed
   * @param {string} packageName Package name
   * @returns {Promise<boolean>} True if installed
   */
  async isPackageInstalled(packageName) {
    // Try dpkg (Debian/Ubuntu)
    let result = await this.execute(`dpkg -l | grep -w ${packageName}`);
    if (result.success && result.stdout.length > 0) {
      return true;
    }

    // Try rpm (RHEL/CentOS)
    result = await this.execute(`rpm -qa | grep -w ${packageName}`);
    if (result.success && result.stdout.length > 0) {
      return true;
    }

    return false;
  }

  /**
   * Get environment variables
   * @returns {Promise<Object>} Environment variables
   */
  async getEnvironmentVariables() {
    const command = 'printenv';
    const result = await this.execute(command);

    if (result.success) {
      const envVars = {};
      result.stdout.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key) {
          envVars[key] = valueParts.join('=');
        }
      });
      return envVars;
    }
    return {};
  }

  /**
   * Test network connectivity
   * @param {string} host Host to ping
   * @param {number} count Number of pings
   * @returns {Promise<Object>} Ping result
   */
  async ping(host, count = 4) {
    const command = `ping -c ${count} ${host}`;
    const result = await this.execute(command);

    return {
      success: result.success,
      output: result.stdout,
      reachable: result.success
    };
  }

  /**
   * Get file permissions
   * @param {string} filePath File path
   * @returns {Promise<Object>} File permissions
   */
  async getFilePermissions(filePath) {
    const command = `stat -c '%a %U %G' "${filePath}"`;
    const result = await this.execute(command);

    if (result.success) {
      const [permissions, owner, group] = result.stdout.split(/\s+/);
      return { permissions, owner, group };
    }
    return {};
  }

  /**
   * Find files by name
   * @param {string} directory Directory to search
   * @param {string} pattern File name pattern
   * @returns {Promise<Array>} Found files
   */
  async findFiles(directory, pattern) {
    const command = `find "${directory}" -name "${pattern}" -type f 2>/dev/null`;
    const result = await this.execute(command);

    if (result.success) {
      return result.stdout.split('\n').filter(f => f.length > 0);
    }
    return [];
  }
}

module.exports = BashIntegration;
