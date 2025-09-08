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
      .form-group {
        margin-bottom: 20px;
      }
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        color: #34495e;
      }
      textarea, input[type="text"], input[type="password"] {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 5px;
        box-sizing: border-box;
        font-size: 16px;
        transition: border-color 0.3s;
      }
      textarea:focus, input[type="text"]:focus, input[type="password"]:focus {
        border-color: #3498db;
        outline: none;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
      }
      button {
        background-color: #3498db;
        color: white;
        border: none;
        padding: 14px 20px;
        border-radius: 5px;
        cursor: pointer;
        width: 100%;
        font-size: 16px;
        font-weight: 600;
        transition: background-color 0.3s;
      }
      button:hover {
        background-color: #2980b9;
      }
      .result {
        margin-top: 20px;
        padding: 15px;
        background-color: #e8f4fc;
        border-radius: 5px;
        display: none;
        border-left: 4px solid #3498db;
      }
      .links-list {
        margin-top: 30px;
      }
      .links-list h2 {
        color: #2c3e50;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
      }
      .link-item {
        padding: 15px 0;
        border-bottom: 1px solid #eee;
      }
      .short-link {
        font-weight: bold;
        color: #3498db;
        text-decoration: none;
      }
      .short-link:hover {
        text-decoration: underline;
      }
      .long-link {
        color: #7f8c8d;
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
        border-left: 4px solid #ffc107;
      }
      .instructions h3 {
        margin-top: 0;
        color: #2c3e50;
      }
      .instructions ul {
        padding-left: 20px;
      }
      .instructions li {
        margin-bottom: 8px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>短链接服务</h1>
      
      <div class="instructions">
        <h3>使用说明</h3>
        <ul>
          <li>在上方输入框中粘贴长链接或输入文本内容</li>
          <li>可选择自定义短链接后缀，留空则自动生成</li>
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
      
      <button id="shortenBtn">生成短链接</button>
      
      <div id="result" class="result"></div>
      
      <div class="links-list">
        <h2>您的短链接</h2>
        <div id="linksList"></div>
      </div>
    </div>

    <script>
      // Generate short link
      document.getElementById('shortenBtn').addEventListener('click', async () => {
        const content = document.getElementById('content').value.trim();
        const slug = document.getElementById('slug').value.trim();
        
        if (!content) {
          alert('请输入网址或文本内容');
          return;
        }
        
        const response = await fetch('/api/shorten', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content, slug })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          document.getElementById('result').style.display = 'block';
          document.getElementById('result').innerHTML = 
            \`<p>短链接创建成功: <a href="\${result.shortUrl}" target="_blank">\${result.shortUrl}</a></p>\`;
          loadLinks();
        } else {
          alert(result.error || '创建短链接时发生错误');
        }
      });
      
      // Load user's links
      async function loadLinks() {
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
      
      // Load links on page load
      loadLinks();
    </script>
  </body>
  </html>
  `;
}