/**
 * AI 工具模块
 * 使用 Cloudflare Workers AI 生成智能短链接后缀
 */

/**
 * 使用 AI 生成智能短链接后缀
 * @param {object} env - Cloudflare 环境对象
 * @param {string} content - 链接内容
 * @param {boolean} isText - 是否为文本内容
 * @returns {Promise<string>} 生成的短链接后缀
 */
export async function generateSmartSlug(env, content, isText) {
  try {
    // 为不同类型的内容定制提示词
    let prompt;
    if (isText) {
      prompt = `根据以下文本内容，生成一个简洁、有意义的英文关键词作为短链接后缀，要求：
1. 只返回关键词，不要有其他内容
2. 使用小写字母和连字符分隔单词
3. 不超过5个单词
4. 尽量准确反映文本主题

文本内容：${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`;
    } else {
      prompt = `根据以下网址，生成一个简洁、有意义的英文关键词作为短链接后缀，要求：
1. 只返回关键词，不要有其他内容
2. 使用小写字母和连字符分隔单词
3. 不超过5个单词
4. 尽量反映网站主题或内容

网址：${content}`;
    }

    // 调用 AI 模型生成后缀
    const response = await env.AI.run(
      "@cf/meta/llama-3.1-8b-instruct",
      { 
        prompt: prompt,
        max_tokens: 15,
        temperature: 0.7
      }
    );

    // 处理 AI 返回结果
    let slug = response.response ? response.response.trim() : '';
    
    // 清理生成的后缀，确保符合要求
    slug = slug
      .toLowerCase()
      .replace(/[^a-z0-9\-_\s]/g, '') // 移除特殊字符
      .replace(/\s+/g, '-') // 空格替换为连字符
      .replace(/-+/g, '-') // 多个连字符合并为一个
      .replace(/^-|-$/g, ''); // 移除首尾连字符
    
    // 如果生成的后缀为空或太短，使用默认方法
    if (!slug || slug.length < 2) {
      return generateFallbackSlug();
    }
    
    // 限制长度
    if (slug.length > 20) {
      slug = slug.substring(0, 20).replace(/-+$/, ''); // 移除结尾的连字符
    }
    
    return slug;
  } catch (error) {
    console.error('AI生成短链接后缀失败:', error);
    // 出错时使用备用方案
    return generateFallbackSlug();
  }
}

/**
 * 生成备用短链接后缀
 * @returns {string} 随机生成的后缀
 */
function generateFallbackSlug(length = 8) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * 验证并清理短链接后缀
 * @param {string} slug - 待验证的后缀
 * @returns {string} 清理后的后缀
 */
export function validateAndCleanSlug(slug) {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, '') // 只保留字母、数字、连字符和下划线
    .replace(/-+/g, '-') // 多个连字符合并为一个
    .replace(/^-|-$/g, '') // 移除首尾连字符
    .substring(0, 30); // 限制长度
}