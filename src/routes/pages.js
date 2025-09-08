/**
 * 页面路由处理模块
 */
import { mainPageTemplate } from '../templates/mainPage.js';
import { adminLoginTemplate } from '../templates/adminLogin.js';
import { adminDashboardTemplate } from '../templates/adminDashboard.js';
import { getLinkFromCache, setLinkToCache, batchGetLinksFromCache, batchSetLinksToCache } from '../utils/cache.js';
import { batchGetLinks, batchUpdateClicks } from '../utils/batch.js';
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

  // 如果是文本内容，展示Markdown格式化内容
  if (link.is_text) {
    logInfo('返回文本内容', { slug });
    // 检查是否为Markdown内容
    const isMarkdown = isMarkdownContent(link.target);
    if (isMarkdown) {
      return handleMarkdownContent(link);
    }
    
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
  const isMarkdown = isMarkdownContent(link.target);
  const content = isMarkdown ? renderMarkdownPreview(link.target) : escapeHtml(link.target);
  
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
        line-height: 1.6;
        color: #333;
        padding: 20px;
        background-color: #f8f9fa;
        border-radius: 5px;
        margin-bottom: 30px;
        max-height: 60vh;
        overflow-y: auto;
      }
      .content.plain {
        white-space: pre-wrap;
        word-break: break-word;
      }
      .content.markdown {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }
      .content.markdown h1,
      .content.markdown h2,
      .content.markdown h3 {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }
      .content.markdown h1 {
        font-size: 2em;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.3em;
      }
      .content.markdown h2 {
        font-size: 1.5em;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.3em;
      }
      .content.markdown h3 {
        font-size: 1.25em;
      }
      .content.markdown p {
        margin: 1em 0;
      }
      .content.markdown ul,
      .content.markdown ol {
        padding-left: 2em;
        margin: 1em 0;
      }
      .content.markdown li {
        margin-bottom: 0.5em;
      }
      .content.markdown code {
        background-color: #eaeaea;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 0.85em;
      }
      .content.markdown pre {
        background-color: #eaeaea;
        padding: 1em;
        border-radius: 5px;
        overflow-x: auto;
      }
      .content.markdown pre code {
        background: none;
        padding: 0;
      }
      .content.markdown blockquote {
        margin: 0;
        padding: 0 1em;
        color: #6a737d;
        border-left: 0.25em solid #dfe2e5;
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
      
      <div class="content ${isMarkdown ? 'markdown' : 'plain'}">${content}</div>
      
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
 * 处理Markdown内容展示
 * @param {object} link - 链接对象
 * @returns {Response} HTTP响应对象
 */
function handleMarkdownContent(link) {
  const htmlContent = renderMarkdown(link.target);
  
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${link.slug} - 短链接服务</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f8f9fa;
        line-height: 1.6;
        color: #333;
      }
      .container {
        background-color: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      h1, h2, h3 {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }
      h1 {
        font-size: 2em;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.3em;
      }
      h2 {
        font-size: 1.5em;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.3em;
      }
      h3 {
        font-size: 1.25em;
      }
      p {
        margin: 1em 0;
      }
      ul, ol {
        padding-left: 2em;
        margin: 1em 0;
      }
      li {
        margin-bottom: 0.5em;
      }
      code {
        background-color: #eaeaea;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 0.85em;
      }
      pre {
        background-color: #eaeaea;
        padding: 1em;
        border-radius: 5px;
        overflow-x: auto;
      }
      pre code {
        background: none;
        padding: 0;
      }
      blockquote {
        margin: 0;
        padding: 0 1em;
        color: #6a737d;
        border-left: 0.25em solid #dfe2e5;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .back-link {
        display: inline-block;
        margin-bottom: 20px;
        color: #3498db;
        text-decoration: none;
      }
      .back-link:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>${link.slug}</h1>
      </div>
      
      <div class="content">${htmlContent}</div>
      
      <a href="/" class="back-link">← 返回主页</a>
    </div>
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
 * 简单的Markdown渲染函数
 * @param {string} markdown - Markdown文本
 * @returns {string} HTML内容
 */
function renderMarkdown(markdown) {
  // 处理代码块
  let html = markdown.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // 处理行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // 处理引用块
  html = html.replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>');
  
  // 处理无序列表
  html = html.replace(/^\s*[-*+] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.+<\/li>)+/gs, '<ul>$&</ul>');
  
  // 处理有序列表
  html = html.replace(/^\s*\d+\. (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.+<\/li>)+/gs, '<ol>$&</ol>');
  
  // 处理粗体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // 处理斜体
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // 处理标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // 处理段落
  html = html.replace(/^\s*([^\s<].*)$/gm, '<p>$1</p>');
  
  return html;
}

/**
 * 渲染Markdown预览
 * @param {string} markdown - Markdown文本
 * @returns {string} HTML内容
 */
function renderMarkdownPreview(markdown) {
  // 只显示前500个字符作为预览
  const previewText = markdown.length > 500 ? markdown.substring(0, 500) + '...' : markdown;
  return renderMarkdown(previewText);
}

/**
 * 检查内容是否为Markdown格式
 * @param {string} content - 内容文本
 * @returns {boolean} 是否为Markdown格式
 */
function isMarkdownContent(content) {
  // 检查是否包含Markdown特征字符
  const markdownPatterns = [
    /^#{1,6}\s/,        // 标题
    /\*\*.*\*\*/,       // 粗体
    /\*.*\*/,           // 斜体
    /`.*`/,             // 代码
    /^\s*[-*+]\s/,      // 无序列表
    /^\s*\d+\.\s/,      // 有序列表
    /^> .*/,            // 引用
    /```[\s\S]*?```/    // 代码块
  ];
  
  return markdownPatterns.some(pattern => pattern.test(content));
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