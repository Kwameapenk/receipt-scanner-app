import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define log levels
const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS'
};

// Color codes for terminal output
const Colors = {
  DEBUG: '\x1b[36m',      // Cyan
  INFO: '\x1b[37m',       // White
  WARN: '\x1b[33m',       // Yellow
  ERROR: '\x1b[31m',      // Red
  SUCCESS: '\x1b[32m',    // Green
  RESET: '\x1b[0m'
};

class Logger {
  constructor(logDir = 'logs') {
    this.logDir = logDir;
    this.logsPath = path.join(__dirname, '../', logDir);
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logsPath)) {
      fs.mkdirSync(this.logsPath, { recursive: true });
    }

    // Create separate log files
    this.errorLogPath = path.join(this.logsPath, 'error.log');
    this.combinedLogPath = path.join(this.logsPath, 'combined.log');
    this.processLogPath = path.join(this.logsPath, 'process.log');
  }

  /**
   * Get formatted timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Format log message
   */
  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    let formatted = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      formatted += `\nData: ${JSON.stringify(data, null, 2)}`;
    }
    
    return formatted;
  }

  /**
   * Write to file
   */
  writeToFile(filePath, message) {
    try {
      fs.appendFileSync(filePath, message + '\n' + '---\n');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  /**
   * Write to console with colors
   */
  writeToConsole(level, message, data = null) {
    const color = Colors[level] || Colors.INFO;
    const timestamp = this.getTimestamp();
    
    console.log(`${color}[${timestamp}] [${level}] ${message}${Colors.RESET}`);
    
    if (data) {
      console.log(color + JSON.stringify(data, null, 2) + Colors.RESET);
    }
  }

  /**
   * Main logging function
   */
  log(level, message, data = null, options = {}) {
    const { 
      writeToConsole = true, 
      writeToCombined = true, 
      writeToSpecific = false 
    } = options;

    const formatted = this.formatMessage(level, message, data);

    // Write to console
    if (writeToConsole) {
      this.writeToConsole(level, message, data);
    }

    // Write to combined log
    if (writeToCombined) {
      this.writeToFile(this.combinedLogPath, formatted);
    }

    // Write to specific log file based on level
    if (writeToSpecific) {
      if (level === LogLevel.ERROR) {
        this.writeToFile(this.errorLogPath, formatted);
      } else if (level === LogLevel.DEBUG || level === LogLevel.INFO || level === LogLevel.SUCCESS) {
        this.writeToFile(this.processLogPath, formatted);
      }
    }
  }

  // Convenience methods
  debug(message, data = null) {
    this.log(LogLevel.DEBUG, message, data, { writeToSpecific: true });
  }

  info(message, data = null) {
    this.log(LogLevel.INFO, message, data, { writeToSpecific: true });
  }

  warn(message, data = null) {
    this.log(LogLevel.WARN, message, data, { writeToSpecific: true });
  }

  error(message, error = null) {
    const errorData = error instanceof Error 
      ? {
          message: error.message,
          stack: error.stack,
          code: error.code
        }
      : error;
    
    this.log(LogLevel.ERROR, message, errorData, { writeToSpecific: true });
  }

  success(message, data = null) {
    this.log(LogLevel.SUCCESS, message, data, { writeToSpecific: true });
  }

  /**
   * Log process step (for tracking workflow)
   */
  logStep(stepName, status = 'started', details = null) {
    const message = `STEP: ${stepName} - ${status.toUpperCase()}`;
    this.info(message, details);
  }

  /**
   * Get log files summary
   */
  getLogsSummary() {
    try {
      const errorLog = fs.readFileSync(this.errorLogPath, 'utf-8');
      const combinedLog = fs.readFileSync(this.combinedLogPath, 'utf-8');
      
      return {
        errorLogSize: errorLog.length,
        combinedLogSize: combinedLog.length,
        errorLogPath: this.errorLogPath,
        combinedLogPath: this.combinedLogPath,
        errorCount: (errorLog.match(/\[ERROR\]/g) || []).length
      };
    } catch (error) {
      return { error: 'Could not read log files' };
    }
  }

  /**
   * Clear logs
   */
  clearLogs() {
    try {
      fs.writeFileSync(this.errorLogPath, '');
      fs.writeFileSync(this.combinedLogPath, '');
      fs.writeFileSync(this.processLogPath, '');
      this.success('All log files cleared');
    } catch (error) {
      this.error('Error clearing logs', error);
    }
  }
}

export default new Logger();