/**
 * 页面路由处理模块
 */
import { mainPageTemplate } from '../templates/mainPage.js';
import { adminLoginTemplate } from '../templates/adminLogin.js';
import { adminDashboardTemplate } from '../templates/adminDashboard.js';

// 处理主页
export async function handleMainPage(request, env) {
  const html = mainPageTemplate();
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}

// 处理管理员登录页面
export async function handleAdminLogin(request, env) {
  const html = adminLoginTemplate();
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}

// 处理管理员控制台
export async function handleAdminDashboard(request, env) {
  const html = adminDashboardTemplate();
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}

// 处理链接跳转
export async function handleRedirect(request, env, slug) {
  const stmt = env.DB.prepare('SELECT * FROM links WHERE slug = ?');
  const link = await stmt.bind(slug).first();

  if (!link) {
    return new Response('您访问的短链接不存在', { status: 404 });
  }

  // 更新点击次数
  const updateStmt = env.DB.prepare('UPDATE links SET clicks = clicks + 1 WHERE id = ?');
  await updateStmt.bind(link.id).run();

  // 如果是文本内容，直接展示
  if (link.is_text) {
    return new Response(link.target, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }

  // 如果是网址，则执行跳转
  return Response.redirect(link.target, 302);
}