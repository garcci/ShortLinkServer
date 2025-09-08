/**
 * 主页模板
 */

export function mainPageTemplate() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>短链接服务</title>
    <style>
      :root {
        --primary-color: #3498db;
        --secondary-color: #2c3e50;
        --success-color: #27ae60;
        --warning-color: #f39c12;
        --danger-color: #e74c3c;
        --light-bg: #f8f9fa;
        --dark-text: #2c3e50;
        --light-text: #7f8c8d;
        --border-color: #ddd;
        --shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background-color: var(--light-bg);
        color: var(--dark-text);
        line-height: 1.6;
      }
      
      .container {
        background-color: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: var(--shadow);
      }
      
      h1 {
        color: var(--secondary-color);
        text-align: center;
        margin-bottom: 30px;
        font-size: 2rem;
      }
      
      .form-group {
        margin-bottom: 20px;
      }
      
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        color: var(--dark-text);
      }
      
      textarea, input[type="text"], input[type="password"] {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--border-color);
        border-radius: 5px;
        box-sizing: border-box;
        font-size: 16px;
        transition: border-color 0.3s, box-shadow 0.3s;
      }
      
      textarea:focus, input[type="text"]:focus, input[type="password"]:focus {
        border-color: var(--primary-color);
        outline: none;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
      }
      
      button {
        background-color: var(--primary-color);
        color: white;
        border: none;
        padding: 14px 20px;
        border-radius: 5px;
        cursor: pointer;
        width: 100%;
        font-size: 16px;
        font-weight: 600;
        transition: background-color 0.3s;
        margin-bottom: 10px;
      }
      
      button:hover {
        background-color: #2980b9;
      }
      
      .btn-secondary {
        background-color: #95a5a6;
      }
      
      .btn-secondary:hover {
        background-color: #7f8c8d;
      }
      
      .result {
        margin-top: 20px;
        padding: 15px;
        background-color: #e8f4fc;
        border-radius: 5px;
        display: none;
        border-left: 4px solid var(--primary-color);
      }
      
      .links-list {
        margin-top: 30px;
      }
      
      .links-list h2 {
        color: var(--secondary-color);
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
      }
      
      .link-item {
        padding: 15px 0;
        border-bottom: 1px solid #eee;
      }
      
      .short-link {
        font-weight: bold;
        color: var(--primary-color);
        text-decoration: none;
      }
      
      .short-link:hover {
        text-decoration: underline;
      }
      
      .long-link {
        color: var(--light-text);
        font-size: 0.9em;
        word-break: break-all;
        margin: 5px 0;
      }
      
      .clicks {
        color: #95a5a6;
        font-size: 0.9em;
      }
      
      .instructions {
        background-color: #fff8e1;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
        border-left: 4px solid var(--warning-color);
      }
      
      .instructions h3 {
        margin-top: 0;
        color: var(--dark-text);
      }
      
      .instructions ul {
        padding-left: 20px;
      }
      
      .instructions li {
        margin-bottom: 8px;
      }
      
      .cache-info {
        background-color: #e8f5e9;
        padding: 10px;
        border-radius: 5px;
        margin-top: 20px;
        font-size: 0.9em;
        color: #2e7d32;
      }
      
      .ai-info {
        background-color: #f3e5f5;
        padding: 10px;
        border-radius: 5px;
        margin-top: 10px;
        font-size: 0.9em;
        color: #6a1b9a;
      }
      
      .checkbox-group {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .checkbox-group input {
        margin-right: 10px;
      }
      
      .feature-highlight {
        background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
        color: white;
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        box-shadow: var(--shadow);
        display: none;
      }
      
      .notification.success {
        background-color: var(--success-color);
      }
      
      .notification.error {
        background-color: var(--danger-color);
      }
      
      @media (max-width: 600px) {
        .container {
          padding: 15px;
        }
        
        h1 {
          font-size: 1.5rem;
        }
      }
    </style>
  </head>
  <body>
    <div class="notification" id="notification"></div>
    
    <div class="container">
      <div class="feature-highlight">
        <h2>✨ AI智能短链接生成 ✨</h2>
        <p>现在支持使用人工智能为您的链接生成有意义的短链接后缀</p>
      </div>
      
      <h1>短链接服务</h1>
      
      <div class="instructions">
        <h3>使用说明</h3>
        <ul>
          <li>在上方输入框中粘贴长链接或输入文本内容</li>
          <li>可选择自定义短链接后缀，留空则自动生成</li>
          <li>启用"AI智能生成"可让AI为您创建有意义的短链接</li>
          <li>点击"生成短链接"按钮完成创建</li>
          <li>访问短链接时，网址将自动跳转或显示文本内容</li>
        </ul>
      </div>
      
      <div class="form-group">
        <label for="content">请输入网址或文本内容：</label>
        <textarea id="content" rows="4" placeholder="例如：https://example.com 或任意文本内容"></textarea>
      </div>
      
      <div class="form-group">
        <label for="slug">自定义短链接后缀（可选）：</label>
        <input type="text" id="slug" placeholder="例如：my-link">
      </div>
      
      <div class="checkbox-group">
        <input type="checkbox" id="useAI" checked>
        <label for="useAI">使用AI智能生成有意义的短链接后缀</label>
      </div>
      
      <button id="shortenBtn">生成短链接</button>
      
      <div class="ai-info">
        <strong>AI智能生成功能：</strong>当您启用此功能时，系统会使用人工智能分析您的内容并生成一个有意义的英文关键词作为短链接后缀，使链接更易记且具有语义。
      </div>
      
      <div id="result" class="result"></div>
      
      <div class="links-list">
        <h2>您的短链接</h2>
        <div id="linksList">
          <p style="text-align: center; color: var(--light-text);">加载中...</p>
        </div>
      </div>
      
      <div class="cache-info">
        为了提高性能并节省请求配额，系统使用了智能缓存机制。热门链接会被自动缓存5分钟，减少数据库查询次数。
      </div>
    </div>

    <script>
      // 显示通知
      function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = 'notification ' + type;
        notification.style.display = 'block';
        
        setTimeout(() => {
          notification.style.display = 'none';
        }, 3000);
      }
      
      // Generate short link
      document.getElementById('shortenBtn').addEventListener('click', async () => {
        const content = document.getElementById('content').value.trim();
        const slug = document.getElementById('slug').value.trim();
        const useAI = document.getElementById('useAI').checked;
        
        if (!content) {
          showNotification('请输入网址或文本内容', 'error');
          return;
        }
        
        // 显示加载状态
        const shortenBtn = document.getElementById('shortenBtn');
        const originalText = shortenBtn.textContent;
        shortenBtn.textContent = '生成中...';
        shortenBtn.disabled = true;
        
        const requestBody = { content };
        if (slug) {
          requestBody.slug = slug;
        } else if (useAI) {
          requestBody.useAI = true;
        }
        
        try {
          const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });
          
          const result = await response.json();
          
          if (response.ok) {
            document.getElementById('result').style.display = 'block';
            const aiMessage = result.isAI ? ' (AI智能生成)' : '';
            document.getElementById('result').innerHTML = 
              \`<p>短链接创建成功\${aiMessage}: <a href="\${result.shortUrl}" target="_blank">\${result.shortUrl}</a></p>\`;
            showNotification('短链接创建成功！');
            
            // 清空表单
            document.getElementById('content').value = '';
            document.getElementById('slug').value = '';
            
            // 创建成功后，延迟加载链接列表，避免过于频繁的请求
            setTimeout(loadLinks, 1000);
          } else {
            showNotification(result.error || '创建短链接时发生错误', 'error');
          }
        } catch (error) {
          showNotification('网络错误，请稍后重试', 'error');
        } finally {
          // 恢复按钮状态
          shortenBtn.textContent = originalText;
          shortenBtn.disabled = false;
        }
      });
      
      // Load user's links with cache consideration
      let lastLoadTime = 0;
      async function loadLinks() {
        const now = Date.now();
        // 限制请求频率，至少间隔5秒
        if (now - lastLoadTime < 5000) {
          console.log('请求过于频繁，跳过本次请求');
          return;
        }
        
        lastLoadTime = now;
        
        try {
          // In a real implementation, we would identify users by something more robust
          // For now, we'll just load all links for demo purposes
          const response = await fetch('/admin/api/links');
          if (response.ok) {
            const links = await response.json();
            const listHtml = links.map(link => 
              \`<div class="link-item">
                <div><a class="short-link" href="/\${link.slug}" target="_blank">\${link.slug}</a></div>
                <div class="long-link">\${link.is_text ? '[文本内容]' : link.target}</div>
                <div class="clicks">点击次数: \${link.clicks} | 创建时间: \${formatDate(link.created_at)}</div>
              </div>\`
            ).join('');
            
            document.getElementById('linksList').innerHTML = listHtml || '<p>暂无短链接记录</p>';
          } else {
            document.getElementById('linksList').innerHTML = '<p>加载失败，请稍后重试</p>';
          }
        } catch (error) {
          document.getElementById('linksList').innerHTML = '<p>网络错误，请稍后重试</p>';
        }
      }
      
      function formatDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return '无效日期';
        }
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
      
      // 页面加载时获取链接列表
      document.addEventListener('DOMContentLoaded', function() {
        // 延迟加载，避免与其他初始化操作冲突
        setTimeout(loadLinks, 500);
      });
    </script>
  </body>
  </html>
  `;
}