/**
 * 管理员登录页面模板
 */

export function adminLoginTemplate() {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>管理员登录 - 短链接服务</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        max-width: 400px;
        margin: 100px auto;
        padding: 20px;
        background-color: #f8f9fa;
      }
      .container {
        background-color: white;
        padding: 40px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        text-align: center;
      }
      h1 {
        color: #2c3e50;
        margin-bottom: 30px;
      }
      .form-group {
        margin-bottom: 20px;
        text-align: left;
      }
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        color: #34495e;
      }
      input[type="password"] {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 5px;
        box-sizing: border-box;
        font-size: 16px;
        transition: border-color 0.3s;
      }
      input[type="password"]:focus {
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
        margin-top: 10px;
      }
      button:hover {
        background-color: #2980b9;
      }
      .error {
        color: #e74c3c;
        margin-top: 15px;
        padding: 10px;
        background-color: #fdf2f2;
        border-radius: 5px;
        display: none;
      }
      .logo {
        font-size: 48px;
        margin-bottom: 20px;
        color: #3498db;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">🔒</div>
      <h1>管理员登录</h1>
      
      <div class="form-group">
        <label for="password">请输入管理员密码：</label>
        <input type="password" id="password" placeholder="请输入登录密码">
      </div>
      
      <button id="loginBtn">登录管理系统</button>
      
      <div id="error" class="error"></div>
    </div>

    <script>
      document.getElementById('loginBtn').addEventListener('click', async () => {
        const password = document.getElementById('password').value.trim();
        
        if (!password) {
          showError('请输入密码');
          return;
        }
        
        const response = await fetch('/admin/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password })
        });
        
        if (response.ok) {
          window.location.href = '/admin/dashboard';
        } else {
          const result = await response.json();
          showError(result.error || '登录失败');
        }
      });
      
      function showError(message) {
        const errorElement = document.getElementById('error');
        errorElement.innerText = message;
        errorElement.style.display = 'block';
      }
    </script>
  </body>
  </html>
  `;
}