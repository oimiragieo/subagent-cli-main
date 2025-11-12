/**
 * Platform Detection and Shell Management
 * Detects the current platform and determines the best shell to use
 */

const os = require('os');
const { execSync } = require('child_process');

class PlatformDetector {
  constructor() {
    this.platform = this.detectPlatform();
    this.architecture = os.arch();
    this.availableShells = this.detectAvailableShells();
  }

  /**
   * Detect the current platform
   * @returns {string} Platform name: 'windows', 'macos', 'linux', 'unix'
   */
  detectPlatform() {
    const platform = os.platform();

    switch (platform) {
      case 'win32':
        return 'windows';
      case 'darwin':
        return 'macos';
      case 'linux':
        return 'linux';
      case 'freebsd':
      case 'openbsd':
      case 'sunos':
        return 'unix';
      default:
        return platform;
    }
  }

  /**
   * Detect available shells on the system
   * @returns {Array<Object>} List of available shells with metadata
   */
  detectAvailableShells() {
    const shells = [];

    if (this.platform === 'windows') {
      // PowerShell 7+ (PowerShell Core)
      if (this.isCommandAvailable('pwsh')) {
        shells.push({
          name: 'pwsh',
          fullName: 'PowerShell Core',
          version: this.getVersion('pwsh --version'),
          platform: 'windows',
          crossPlatform: true,
          priority: 1
        });
      }

      // Windows PowerShell 5.1
      if (this.isCommandAvailable('powershell')) {
        shells.push({
          name: 'powershell',
          fullName: 'Windows PowerShell',
          version: this.getVersion('powershell -Command "$PSVersionTable.PSVersion.ToString()"'),
          platform: 'windows',
          crossPlatform: false,
          priority: 2
        });
      }

      // Command Prompt
      shells.push({
        name: 'cmd',
        fullName: 'Command Prompt',
        version: this.getVersion('cmd /c ver'),
        platform: 'windows',
        crossPlatform: false,
        priority: 3
      });

      // Git Bash (if installed)
      if (this.isCommandAvailable('bash')) {
        shells.push({
          name: 'bash',
          fullName: 'Git Bash / WSL Bash',
          version: this.getVersion('bash --version'),
          platform: 'windows',
          crossPlatform: true,
          priority: 4
        });
      }
    } else {
      // Unix-like systems (macOS, Linux, BSD)

      // Zsh (default on macOS Catalina+)
      if (this.isCommandAvailable('zsh')) {
        shells.push({
          name: 'zsh',
          fullName: 'Z Shell',
          version: this.getVersion('zsh --version'),
          platform: this.platform,
          crossPlatform: true,
          priority: this.platform === 'macos' ? 1 : 2
        });
      }

      // Bash (universal)
      if (this.isCommandAvailable('bash')) {
        shells.push({
          name: 'bash',
          fullName: 'Bourne Again Shell',
          version: this.getVersion('bash --version'),
          platform: this.platform,
          crossPlatform: true,
          priority: 1
        });
      }

      // Fish Shell
      if (this.isCommandAvailable('fish')) {
        shells.push({
          name: 'fish',
          fullName: 'Friendly Interactive Shell',
          version: this.getVersion('fish --version'),
          platform: this.platform,
          crossPlatform: true,
          priority: 3
        });
      }

      // PowerShell Core (cross-platform)
      if (this.isCommandAvailable('pwsh')) {
        shells.push({
          name: 'pwsh',
          fullName: 'PowerShell Core',
          version: this.getVersion('pwsh --version'),
          platform: this.platform,
          crossPlatform: true,
          priority: 4
        });
      }

      // sh (POSIX shell - always available)
      shells.push({
        name: 'sh',
        fullName: 'POSIX Shell',
        version: 'system',
        platform: this.platform,
        crossPlatform: true,
        priority: 99
      });
    }

    return shells.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Check if a command is available on the system
   * @param {string} command Command to check
   * @returns {boolean} True if command is available
   */
  isCommandAvailable(command) {
    try {
      if (this.platform === 'windows') {
        execSync(`where ${command}`, { stdio: 'ignore' });
      } else {
        execSync(`which ${command}`, { stdio: 'ignore' });
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get version information for a command
   * @param {string} versionCommand Command to get version
   * @returns {string} Version string or 'unknown'
   */
  getVersion(versionCommand) {
    try {
      const version = execSync(versionCommand, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
        timeout: 5000
      });
      return version.trim().split('\n')[0];
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Get the default shell for the platform
   * @returns {Object} Default shell object
   */
  getDefaultShell() {
    return this.availableShells[0] || { name: 'sh', fullName: 'Default Shell' };
  }

  /**
   * Get shell by name
   * @param {string} name Shell name
   * @returns {Object|null} Shell object or null
   */
  getShellByName(name) {
    return this.availableShells.find(shell => shell.name === name) || null;
  }

  /**
   * Get all cross-platform shells
   * @returns {Array<Object>} List of cross-platform shells
   */
  getCrossPlatformShells() {
    return this.availableShells.filter(shell => shell.crossPlatform);
  }

  /**
   * Get platform-specific information
   * @returns {Object} Platform information
   */
  getPlatformInfo() {
    return {
      platform: this.platform,
      architecture: this.architecture,
      hostname: os.hostname(),
      osType: os.type(),
      osRelease: os.release(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length,
      uptime: os.uptime(),
      homeDir: os.homedir(),
      tmpDir: os.tmpdir(),
      defaultShell: this.getDefaultShell(),
      availableShells: this.availableShells
    };
  }

  /**
   * Check if running on Windows
   * @returns {boolean}
   */
  isWindows() {
    return this.platform === 'windows';
  }

  /**
   * Check if running on macOS
   * @returns {boolean}
   */
  isMacOS() {
    return this.platform === 'macos';
  }

  /**
   * Check if running on Linux
   * @returns {boolean}
   */
  isLinux() {
    return this.platform === 'linux';
  }

  /**
   * Check if running on Unix-like system
   * @returns {boolean}
   */
  isUnix() {
    return ['macos', 'linux', 'unix'].includes(this.platform);
  }

  /**
   * Get path separator for the platform
   * @returns {string} Path separator
   */
  getPathSeparator() {
    return this.platform === 'windows' ? '\\' : '/';
  }

  /**
   * Get environment variable path separator
   * @returns {string} Environment path separator
   */
  getEnvPathSeparator() {
    return this.platform === 'windows' ? ';' : ':';
  }

  /**
   * Get line ending for the platform
   * @returns {string} Line ending
   */
  getLineEnding() {
    return this.platform === 'windows' ? '\r\n' : '\n';
  }
}

module.exports = PlatformDetector;
