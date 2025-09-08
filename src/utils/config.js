/**
 * 配置管理模块
 * 集中管理项目配置参数
 */

// 缓存配置
export const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5分钟缓存时间
  CLEANUP_INTERVAL: 60 * 1000 // 1分钟清理一次过期缓存
};

// 分页配置
export const PAGINATION_CONFIG = {
  ADMIN_PAGE_SIZE: 50, // 管理员页面每页显示链接数
  MAIN_PAGE_SIZE: 20   // 主页面每页显示链接数
};

// 请求频率限制配置
export const RATE_LIMIT_CONFIG = {
  MAIN_PAGE_LOAD_INTERVAL: 5000, // 主页面加载链接列表最小间隔（毫秒）
  ADMIN_PAGE_LOAD_INTERVAL: 2000 // 管理员页面加载链接列表最小间隔（毫秒）
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