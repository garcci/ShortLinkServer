/**
 * API 路由处理模块
 */
import { deleteLinkFromCache } from '../utils/cache.js';
import { generateSmartSlug, validateAndCleanSlug } from '../utils/ai.js';

// 生成随机 slug
function generateSlug(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// 处理创建短链接
export async function handleCreateShortLink(request, env) {
  try {
    const { content, slug, useAI = false } = await request.json();

    if (!content) {
      return new Response(JSON.stringify({ error: '内容不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 检查内容是 URL 还是文本
    let isUrl = false;
    let target = content;
    try {
      new URL(content);
      isUrl = true;
    } catch (e) {
      // 不是有效的 URL，当作文本处理
    }

    const isText = !isUrl;

    // 处理 slug
    let finalSlug = slug;
    
    // 如果用户提供了 slug，验证并清理它
    if (finalSlug) {
      finalSlug = validateAndCleanSlug(finalSlug);
      if (!finalSlug) {
        return new Response(JSON.stringify({ error: '自定义短链接后缀无效' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } 
    // 如果用户要求使用 AI 生成，或者没有提供 slug 且启用了 AI
    else if (useAI || !finalSlug) {
      try {
        finalSlug = await generateSmartSlug(env, content, isText);
      } catch (error) {
        console.error('AI生成失败，使用默认方法:', error);
        finalSlug = generateSlug(8);
      }
    } 
    // 默认情况生成随机 slug
    else {
      finalSlug = generateSlug();
    }

    // 检查 slug 是否已存在
    const existing = await env.DB.prepare('SELECT id FROM links WHERE slug = ?')
      .bind(finalSlug)
      .first();

    if (existing) {
      // 如果是AI生成的slug冲突，尝试添加数字后缀
      if (useAI || !slug) {
        let counter = 1;
        let newSlug = `${finalSlug}-${counter}`;
        while (counter < 10) { // 最多尝试10次
          const check = await env.DB.prepare('SELECT id FROM links WHERE slug = ?')
            .bind(newSlug)
            .first();
          if (!check) {
            finalSlug = newSlug;
            break;
          }
          counter++;
          newSlug = `${finalSlug}-${counter}`;
        }
        // 如果还是冲突，使用随机生成
        if (counter >= 10) {
          finalSlug = generateSlug(8);
        }
      } else {
        return new Response(JSON.stringify({ error: '短链接后缀已存在，请尝试其他后缀' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 插入数据库
    const stmt = env.DB.prepare(`
      INSERT INTO links (slug, target, is_text, created_at, clicks)
      VALUES (?, ?, ?, datetime('now'), 0)
    `);
    await stmt.bind(finalSlug, target, isText ? 1 : 0).run();

    const shortUrl = new URL(request.url).origin + '/' + finalSlug;

    return new Response(JSON.stringify({ 
      shortUrl,
      slug: finalSlug,
      isAI: useAI || !slug // 标记是否使用了AI生成
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('创建短链接时出错:', e);
    return new Response(JSON.stringify({ error: '服务器内部错误，请稍后重试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 处理管理员登录 API
export async function handleAdminLoginAPI(request, env) {
  try {
    const { password } = await request.json();

    // 在实际应用中，我们会检查存储的哈希值
    // 这里使用简单检查
    if (password === 'admin') {
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: '服务器内部错误，请稍后重试' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// 处理管理员 API 请求
export async function handleAdminAPI(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 获取所有链接
  if (path === '/admin/api/links') {
    const { results } = await env.DB.prepare('SELECT * FROM links ORDER BY created_at DESC').all();
    return new Response(JSON.stringify(results), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // 删除链接
  const deleteMatch = path.match(/^\/admin\/api\/links\/(\d+)$/);
  if (request.method === 'DELETE' && deleteMatch) {
    const id = deleteMatch[1];
    // 先查询要删除的链接信息，用于清理缓存
    const link = await env.DB.prepare('SELECT slug FROM links WHERE id = ?').bind(id).first();
    
    // 从数据库删除
    await env.DB.prepare('DELETE FROM links WHERE id = ?').bind(id).run();
    
    // 如果存在，则从缓存中删除
    if (link) {
      deleteLinkFromCache(link.slug);
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  return new Response('页面未找到', { status: 404 });
}