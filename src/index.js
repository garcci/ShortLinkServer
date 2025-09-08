/**
 * 短链接服务 - 基于 Cloudflare Worker 和 D1 数据库
 * 
 * 提供以下功能：
 * 1. 短链接生成服务（支持网址跳转和文本展示）
 * 2. 管理员后台系统
 * 3. 链接访问统计
 * 4. 响应式前端界面
 */

import { handleMainPage, handleAdminLogin, handleAdminDashboard, handleRedirect } from './routes/pages.js';
import { handleCreateShortLink, handleAdminLoginAPI, handleAdminAPI } from './routes/api.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 处理链接跳转请求
    if (request.method === 'GET' && path !== '/' && !path.startsWith('/admin')) {
      const slug = path.substring(1);
      return handleRedirect(request, env, slug);
    }

    // 处理主页请求
    if (request.method === 'GET' && path === '/') {
      return handleMainPage(request, env);
    }

    // 处理短链接创建 API
    if (request.method === 'POST' && path === '/api/shorten') {
      return handleCreateShortLink(request, env);
    }

    // 处理管理员登录页面
    if (request.method === 'GET' && path === '/admin') {
      return handleAdminLogin(request, env);
    }

    // 处理管理员控制台
    if (request.method === 'GET' && path === '/admin/dashboard') {
      return handleAdminDashboard(request, env);
    }

    // 处理管理员登录 API
    if (request.method === 'POST' && path === '/admin/api/login') {
      return handleAdminLoginAPI(request, env);
    }

    // 处理管理员 API 请求 (GET)
    if (request.method === 'GET' && path === '/admin/api/links') {
      return handleAdminAPI(request, env);
    }
    
    // 处理管理员 API 请求 (DELETE)
    if (request.method === 'DELETE' && path.startsWith('/admin/api/links/')) {
      return handleAdminAPI(request, env);
    }

    return new Response('页面未找到', { status: 404 });
  }
};

// 生成随机 slug
function generateSlug(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}