/**
 * 批处理工具模块
 * 用于合并多个数据库操作，减少请求次数
 */

/**
 * 批量获取链接信息
 * @param {object} env - Cloudflare环境对象
 * @param {Array<string>} slugs - 链接标识数组
 * @returns {Promise<object>} 链接信息映射
 */
export async function batchGetLinks(env, slugs) {
  if (!slugs || slugs.length === 0) {
    return {};
  }

  // 限制批处理大小以避免查询过长
  const batchSize = 50;
  const results = {};

  for (let i = 0; i < slugs.length; i += batchSize) {
    const batch = slugs.slice(i, i + batchSize);
    const placeholders = batch.map(() => '?').join(',');
    const query = `SELECT * FROM links WHERE slug IN (${placeholders})`;
    
    try {
      const stmt = env.DB.prepare(query);
      const boundStmt = batch.reduce((acc, slug, index) => {
        return index === 0 ? acc.bind(slug) : acc.bind(slug);
      }, stmt);
      
      const { results: batchResults } = await boundStmt.all();
      
      batchResults.forEach(link => {
        results[link.slug] = link;
      });
    } catch (error) {
      console.error('批量获取链接失败:', error);
      // 出错时逐个获取
      for (const slug of batch) {
        try {
          const stmt = env.DB.prepare('SELECT * FROM links WHERE slug = ?');
          const link = await stmt.bind(slug).first();
          if (link) {
            results[link.slug] = link;
          }
        } catch (e) {
          console.error(`获取链接 ${slug} 失败:`, e);
        }
      }
    }
  }

  return results;
}

/**
 * 批量更新点击次数
 * @param {object} env - Cloudflare环境对象
 * @param {Array<object>} links - 链接对象数组
 * @returns {Promise<void>}
 */
export async function batchUpdateClicks(env, links) {
  if (!links || links.length === 0) {
    return;
  }

  // 限制批处理大小
  const batchSize = 25;
  
  for (let i = 0; i < links.length; i += batchSize) {
    const batch = links.slice(i, i + batchSize);
    
    // 构建批量更新语句
    const updateStatements = batch.map(link => 
      `UPDATE links SET clicks = clicks + 1 WHERE id = ${link.id};`
    ).join(' ');
    
    try {
      // 执行批量更新
      await env.DB.batch(
        batch.map(link => 
          env.DB.prepare('UPDATE links SET clicks = clicks + 1 WHERE id = ?').bind(link.id)
        )
      );
    } catch (error) {
      console.error('批量更新点击次数失败:', error);
      // 出错时逐个更新
      for (const link of batch) {
        try {
          const stmt = env.DB.prepare('UPDATE links SET clicks = clicks + 1 WHERE id = ?');
          await stmt.bind(link.id).run();
        } catch (e) {
          console.error(`更新链接 ${link.slug} 点击次数失败:`, e);
        }
      }
    }
  }
}