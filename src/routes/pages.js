/**
 * 页面路由处理模块
 */
import { mainPageTemplate } from '../templates/mainPage.js';
import { adminLoginTemplate } from '../templates/adminLogin.js';
import { adminDashboardTemplate } from '../templates/adminDashboard.js';
import { getLinkFromCache, setLinkToCache } from '../utils/cache.js';
import { info as logInfo, error as logError } from '../utils/logger.js';

/**
 * 处理主页
 * @param {Request} request - HTTP请求对象
 * @param {object} env - Cloudflare环境对象
 * @returns {Response} HTTP响应对象
 */
export async function handleMainPage(request, env) {
  const html = mainPageTemplate();
  logInfo('访问主页');
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}

/**
 * 处理管理员登录页面
 * @param {Request} request - HTTP请求对象
 * @param {object} env - Cloudflare环境对象
 * @returns {Response} HTTP响应对象
 */
export async function handleAdminLogin(request, env) {
  const html = adminLoginTemplate();
  logInfo('访问管理员登录页面');
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}

/**
 * 处理管理员控制台
 * @param {Request} request - HTTP请求对象
 * @param {object} env - Cloudflare环境对象
 * @returns {Response} HTTP响应对象
 */
export async function handleAdminDashboard(request, env) {
  const html = adminDashboardTemplate();
  logInfo('访问管理员控制台');
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}

/**
 * 处理链接跳转
 * @param {Request} request - HTTP请求对象
 * @param {object} env - Cloudflare环境对象
 * @param {string} slug - 链接标识
 * @returns {Response} HTTP响应对象
 */
export async function handleRedirect(request, env, slug) {
  // 首先尝试从缓存获取
  let link = getLinkFromCache(slug);
  
  if (!link) {
    // 缓存未命中，查询数据库
    try {
      const stmt = env.DB.prepare('SELECT * FROM links WHERE slug = ?');
      link = await stmt.bind(slug).first();
      
      if (link) {
        // 将结果存入缓存
        setLinkToCache(slug, link);
        logInfo('从数据库获取链接信息并缓存', { slug });
      }
    } catch (e) {
      logError('查询链接信息时出错', { error: e.message, slug });
      return new Response('服务器内部错误', { status: 500 });
    }
  } else {
    logInfo('从缓存获取链接信息', { slug });
  }

  if (!link) {
    logInfo('访问不存在的链接', { slug });
    return new Response('您访问的短链接不存在', { status: 404 });
  }

  // 检查是否需要预览文本内容
  const preview = new URL(request.url).searchParams.get('preview') === '1';
  
  // 如果是文本内容且需要预览
  if (link.is_text && preview) {
    logInfo('显示文本预览', { slug });
    return handleTextPreview(link);
  }

  // 更新点击次数（仅在数据库中更新，缓存中不更新点击数）
  try {
    const updateStmt = env.DB.prepare('UPDATE links SET clicks = clicks + 1 WHERE id = ?');
    await updateStmt.bind(link.id).run();
    logInfo('更新链接点击次数', { slug, clicks: link.clicks + 1 });
  } catch (e) {
    logError('更新链接点击次数时出错', { error: e.message, slug });
  }

  // 如果是文本内容，直接展示
  if (link.is_text) {
    logInfo('返回文本内容', { slug });
    return new Response(link.target, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }

  // 如果是网址，则执行跳转
  logInfo('重定向到目标网址', { slug, target: link.target });
  return Response.redirect(link.target, 302);
}

/**
 * 处理文本预览
 * @param {object} link - 链接对象
 * @returns {Response} HTTP响应对象
 */
function handleTextPreview(link) {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>内容预览 - 短链接服务</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f8f9fa;
      }
      .container {
        background-color: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      h1 {
        color: #2c3e50;
        text-align: center;
        margin-bottom: 30px;
      }
      .content {
        white-space: pre-wrap;
        word-break: break-word;
        line-height: 1.6;
        color: #333;
        padding: 20px;
        background-color: #f8f9fa;
        border-radius: 5px;
        margin-bottom: 30px;
        max-height: 60vh;
        overflow-y: auto;
      }
      .actions {
        display: flex;
        justify-content: center;
        gap: 20px;
        flex-wrap: wrap;
      }
      .btn {
        padding: 12px 24px;
        border-radius: 5px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s;
        cursor: pointer;
        border: none;
        font-size: 16px;
      }
      .btn-primary {
        background-color: #3498db;
        color: white;
      }
      .btn-primary:hover {
        background-color: #2980b9;
      }
      .btn-secondary {
        background-color: #95a5a6;
        color: white;
      }
      .btn-secondary:hover {
        background-color: #7f8c8d;
      }
      .info {
        background-color: #fff8e1;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
        border-left: 4px solid #ffc107;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>内容预览</h1>
      
      <div class="info">
        <p>您正在预览短链接中的文本内容。确认无误后可点击"查看完整内容"按钮。</p>
      </div>
      
      <div class="content">${escapeHtml(link.target)}</div>
      
      <div class="actions">
        <button class="btn btn-primary" onclick="window.location.href = window.location.pathname">查看完整内容</button>
        <button class="btn btn-secondary" onclick="window.history.back()">返回</button>
      </div>
    </div>
    
    <script>
      // 检测是否为纯文本链接（没有preview参数）
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.has('preview')) {
        // 如果用户直接访问文本链接，显示预览
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('preview', '1');
        window.history.replaceState({}, '', newUrl);
      }
    </script>
  </body>
  </html>
  `;
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}

/**
 * HTML转义函数
 * @param {string} text - 待转义的文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}