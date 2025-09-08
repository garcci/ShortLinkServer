/**
 * 日志工具模块
 * 统一处理应用日志
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LOG_LEVEL = LOG_LEVELS.INFO;

/**
 * 记录日志
 * @param {string} level - 日志级别
 * @param {string} message - 日志消息
 * @param {object} data - 附加数据
 */
function log(level, message, data = null) {
  const levelValue = LOG_LEVELS[level];
  if (levelValue <= CURRENT_LOG_LEVEL) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message
    };
    
    if (data) {
      logEntry.data = data;
    }
    
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * 记录错误日志
 * @param {string} message - 错误消息
 * @param {object} error - 错误对象
 */
export function error(message, error = null) {
  log('ERROR', message, error);
}

/**
 * 记录警告日志
 * @param {string} message - 警告消息
 * @param {object} data - 附加数据
 */
export function warn(message, data = null) {
  log('WARN', message, data);
}

/**
 * 记录信息日志
 * @param {string} message - 信息消息
 * @param {object} data - 附加数据
 */
export function info(message, data = null) {
  log('INFO', message, data);
}

/**
 * 记录调试日志
 * @param {string} message - 调试消息
 * @param {object} data - 附加数据
 */
export function debug(message, data = null) {
  log('DEBUG', message, data);
}