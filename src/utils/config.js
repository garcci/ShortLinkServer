/**
 * 配置管理模块
 * 集中管理项目配置参数
 */

// 缓存配置
export const CACHE_CONFIG = {
  TTL: 10 * 60 * 1000, // 10分钟缓存时间（增加缓存时间以减少请求）
  CLEANUP_INTERVAL: 60 * 1000 // 1分钟清理一次过期缓存
};

// 分页配置
export const PAGINATION_CONFIG = {
  ADMIN_PAGE_SIZE: 50, // 管理员页面每页显示链接数
  MAIN_PAGE_SIZE: 20   // 主页面每页显示链接数
};

// 请求频率限制配置
export const RATE_LIMIT_CONFIG = {
  MAIN_PAGE_LOAD_INTERVAL: 10000, // 主页面加载链接列表最小间隔（10秒，增加间隔以减少请求）
  ADMIN_PAGE_LOAD_INTERVAL: 5000  // 管理员页面加载链接列表最小间隔（5秒）
};

// AI配置
export const AI_CONFIG = {
  MODEL: "@cf/meta/llama-3.1-8b-instruct",
  MAX_TOKENS: 15,
  TEMPERATURE: 0.7,
  FALLBACK_LENGTH: 8
};

// 短链接配置
export const SLUG_CONFIG = {
  MAX_LENGTH: 30,
  MIN_LENGTH: 2,
  DEFAULT_LENGTH: 6
};

// 批处理配置
export const BATCH_CONFIG = {
  MAX_BATCH_SIZE: 50, // 最大批处理大小
  BATCH_TIMEOUT: 100  // 批处理超时时间（毫秒）
};