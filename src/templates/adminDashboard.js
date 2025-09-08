/**
 * 管理员控制台模板
 */

export function adminDashboardTemplate() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>管理控制台 - 短链接服务</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f8f9fa;
      }
      .header {
        background-color: #2c3e50;
        color: white;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .header h1 {
        margin: 0;
        font-size: 1.5em;
      }
      .container {
        max-width: 1200px;
        margin: 20px auto;
        padding: 0 20px;
      }
      .links-table {
        width: 100%;
        border-collapse: collapse;
        background-color: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        border-radius: 5px;
        overflow: hidden;
      }
      .links-table th, .links-table td {
        padding: 15px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      .links-table th {
        background-color: #f8f9fa;
        font-weight: 600;
        color: #2c3e50;
        text-transform: uppercase;
        font-size: 0.85em;
        letter-spacing: 0.5px;
      }
      .links-table tr:hover {
        background-color: #f5f9ff;
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
        word-break: break-all;
        font-size: 0.9em;
      }
      .action-btn {
        background-color: #e74c3c;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 0.9em;
        transition: background-color 0.3s;
      }
      .action-btn:hover {
        background-color: #c0392b;
      }
      .stats {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      .stat-card {
        background: white;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        flex: 1;
        min-width: 200px;
      }
      .stat-card h3 {
        margin-top: 0;
        color: #7f8c8d;
        font-size: 1em;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .stat-card .value {
        font-size: 2em;
        font-weight: bold;
        color: #2c3e50;
      }
      .type-tag {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 3px;
        font-size: 0.8em;
        font-weight: bold;
      }
      .type-url {
        background-color: #e1f0fa;
        color: #3498db;
      }
      .type-text {
        background-color: #fff3e0;
        color: #f39c12;
      }
      .clicks-cell {
        font-weight: bold;
        color: #27ae60;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>管理控制台</h1>
      <button id="logoutBtn" class="action-btn">退出登录</button>
    </div>
    
    <div class="container">
      <div class="stats">
        <div class="stat-card">
          <h3>总链接数</h3>
          <div class="value" id="totalLinks">0</div>
        </div>
        <div class="stat-card">
          <h3>总点击数</h3>
          <div class="value" id="totalClicks">0</div>
        </div>
        <div class="stat-card">
          <h3>文本链接</h3>
          <div class="value" id="textLinks">0</div>
        </div>
        <div class="stat-card">
          <h3>网址链接</h3>
          <div class="value" id="urlLinks">0</div>
        </div>
      </div>
      
      <h2>所有短链接</h2>
      <table class="links-table">
        <thead>
          <tr>
            <th>短链接</th>
            <th>原始内容</th>
            <th>类型</th>
            <th>点击次数</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody id="linksTableBody">
          <!-- Links will be loaded here -->
        </tbody>
      </table>
    </div>

    <script>
      // Load all links and stats
      async function loadLinks() {
        const response = await fetch('/admin/api/links');
        if (response.ok) {
          const links = await response.json();
          const tbody = document.getElementById('linksTableBody');
          
          // Update stats
          updateStats(links);
          
          tbody.innerHTML = links.map(link => 
            \`<tr>
              <td><a class="short-link" href="/\${link.slug}" target="_blank">\${link.slug}</a></td>
              <td class="long-link">\${link.is_text ? '[文本内容]' : link.target}</td>
              <td><span class="type-tag \${link.is_text ? 'type-text' : 'type-url'}">\${link.is_text ? '文本' : '网址'}</span></td>
              <td class="clicks-cell">\${link.clicks}</td>
              <td>\${formatDate(link.created_at)}</td>
              <td><button class="action-btn" onclick="deleteLink(\${link.id})">删除</button></td>
            </tr>\`
          ).join('');
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
      
      function updateStats(links) {
        const totalLinks = links.length;
        const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
        const textLinks = links.filter(link => link.is_text).length;
        const urlLinks = links.filter(link => !link.is_text).length;
        
        document.getElementById('totalLinks').textContent = totalLinks;
        document.getElementById('totalClicks').textContent = totalClicks;
        document.getElementById('textLinks').textContent = textLinks;
        document.getElementById('urlLinks').textContent = urlLinks;
      }
      
      // Delete a link
      async function deleteLink(id) {
        if (!confirm('确定要删除这个链接吗？此操作不可撤销。')) {
          return;
        }
        
        const response = await fetch('/admin/api/links/' + id, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          loadLinks();
        } else {
          alert('删除链接失败');
        }
      }
      
      // Logout
      document.getElementById('logoutBtn').addEventListener('click', () => {
        // In a real implementation, we would clear session/cookie
        window.location.href = '/admin';
      });
      
      // Load links on page load
      loadLinks();
    </script>
  </body>
  </html>
  `;
}