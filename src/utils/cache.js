/**
 * 缓存工具模块
 * 用于减少数据库请求次数，提高性能并节省请求配额
 */
import { CACHE_CONFIG } from './config.js';

// 使用全局变量作为内存缓存
const linkCache = new Map();

/**
 * 获取链接缓存
 * @param {string} slug - 链接标识
 * @returns {object|null} 链接信息或null
 */
export function getLinkFromCache(slug) {
  const cached = linkCache.get(slug);
  if (cached && Date.now() - cached.timestamp < CACHE_CONFIG.TTL) {
    return cached.data;
  }
  // 缓存过期，删除条目
  linkCache.delete(slug);
  return null;
}

/**
 * 批量获取链接缓存
 * @param {Array<string>} slugs - 链接标识数组
 * @returns {object} 链接信息映射
 */
export function batchGetLinksFromCache(slugs) {
  const results = {};
  const missing = [];
  
  for (const slug of slugs) {
    const cached = linkCache.get(slug);
    if (cached && Date.now() - cached.timestamp < CACHE_CONFIG.TTL) {
      results[slug] = cached.data;
    } else {
      // 缓存过期或不存在，记录缺失项
      linkCache.delete(slug);
      missing.push(slug);
    }
  }
  
  return {
    results,
    missing
  };
}

/**
 * 设置链接缓存
 * @param {string} slug - 链接标识
 * @param {object} data - 链接数据
 */
export function setLinkToCache(slug, data) {
  linkCache.set(slug, {
    data: data,
    timestamp: Date.now()
  });
}

/**
 * 批量设置链接缓存
 * @param {object} links - 链接数据映射
 */
export function batchSetLinksToCache(links) {
  const now = Date.now();
  for (const [slug, data] of Object.entries(links)) {
    linkCache.set(slug, {
      data: data,
      timestamp: now
    });
  }
}

/**
 * 从缓存中删除链接
 * @param {string} slug - 链接标识
 */
export function deleteLinkFromCache(slug) {
  linkCache.delete(slug);
}

/**
 * 批量从缓存中删除链接
 * @param {Array<string>} slugs - 链接标识数组
 */
export function batchDeleteLinksFromCache(slugs) {
  for (const slug of slugs) {
    linkCache.delete(slug);
  }
}

/**
 * 清理过期缓存
 */
export function cleanupExpiredCache() {
  const now = Date.now();
  let cleanedCount = 0;
  for (const [key, value] of linkCache.entries()) {
    if (now - value.timestamp >= CACHE_CONFIG.TTL) {
      linkCache.delete(key);
      cleanedCount++;
    }
  }
  return cleanedCount;
}

/**
 * 获取缓存统计信息
 * @returns {object} 缓存统计信息
 */
export function getCacheStats() {
  return {
    size: linkCache.size,
    maxSize: Infinity, // Map理论上无上限
  };
}