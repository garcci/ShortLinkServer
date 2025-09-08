/**
 * Short Link Server - Cloudflare Worker with D1 Database
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle redirect requests
    if (request.method === 'GET' && path !== '/') {
      const slug = path.substring(1);
      return handleRedirect(request, env, slug);
    }

    // Handle main page
    if (request.method === 'GET') {
      return handleMainPage(request, env);
    }

    // Handle API requests
    if (request.method === 'POST' && path === '/api/shorten') {
      return handleCreateShortLink(request, env);
    }

    // Handle admin login
    if (request.method === 'GET' && path === '/admin') {
      return handleAdminLogin(request, env);
    }

    // Handle admin dashboard
    if (request.method === 'GET' && path === '/admin/dashboard') {
      return handleAdminDashboard(request, env);
    }

    // Handle admin API
    if (request.method === 'POST' && path === '/admin/api/login') {
      return handleAdminLoginAPI(request, env);
    }

    if (request.method === 'GET' && path.startsWith('/admin/api/')) {
      return handleAdminAPI(request, env);
    }

    return new Response('Not Found', { status: 404 });
  }
};

// Handle link redirect
async function handleRedirect(request, env, slug) {
  const stmt = env.DB.prepare('SELECT * FROM links WHERE slug = ?');
  const link = await stmt.bind(slug).first();

  if (!link) {
    return new Response('Link not found', { status: 404 });
  }

  // Update click count
  const updateStmt = env.DB.prepare('UPDATE links SET clicks = clicks + 1 WHERE id = ?');
  await updateStmt.bind(link.id).run();

  // If it's a text, show the text
  if (link.is_text) {
    return new Response(link.target, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }

  // If it's a URL, redirect
  return Response.redirect(link.target, 302);
}

// Handle main page
async function handleMainPage(request, env) {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Short Link Service</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f5f5f5;
      }
      .container {
        background-color: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      h1 {
        color: #333;
        text-align: center;
      }
      .form-group {
        margin-bottom: 20px;
      }
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      textarea, input[type="text"], input[type="password"] {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        box-sizing: border-box;
      }
      button {
        background-color: #0070f3;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 5px;
        cursor: pointer;
        width: 100%;
        font-size: 16px;
      }
      button:hover {
        background-color: #0055cc;
      }
      .result {
        margin-top: 20px;
        padding: 15px;
        background-color: #f0f8ff;
        border-radius: 5px;
        display: none;
      }
      .links-list {
        margin-top: 30px;
      }
      .links-list h2 {
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
      }
      .link-item {
        padding: 10px 0;
        border-bottom: 1px solid #eee;
      }
      .short-link {
        font-weight: bold;
        color: #0070f3;
      }
      .long-link {
        color: #666;
        font-size: 0.9em;
        word-break: break-all;
      }
      .clicks {
        color: #999;
        font-size: 0.9em;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Short Link Service</h1>
      
      <div class="form-group">
        <label for="content">Enter URL or Text:</label>
        <textarea id="content" rows="4" placeholder="https://example.com or any text content"></textarea>
      </div>
      
      <div class="form-group">
        <label for="slug">Custom Short Link (optional):</label>
        <input type="text" id="slug" placeholder="custom-link">
      </div>
      
      <button id="shortenBtn">Generate Short Link</button>
      
      <div id="result" class="result"></div>
      
      <div class="links-list">
        <h2>Your Short Links</h2>
        <div id="linksList"></div>
      </div>
    </div>

    <script>
      // Generate short link
      document.getElementById('shortenBtn').addEventListener('click', async () => {
        const content = document.getElementById('content').value.trim();
        const slug = document.getElementById('slug').value.trim();
        
        if (!content) {
          alert('Please enter a URL or text');
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
            \`<p>Short Link: <a href="\${result.shortUrl}" target="_blank">\${result.shortUrl}</a></p>\`;
          loadLinks();
        } else {
          alert(result.error || 'Error generating short link');
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
              <div class="short-link"><a href="/\${link.slug}" target="_blank">\${link.slug}</a></div>
              <div class="long-link">\${link.is_text ? 'TEXT' : link.target}</div>
              <div class="clicks">Clicks: \${link.clicks}</div>
            </div>\`
          ).join('');
          
          document.getElementById('linksList').innerHTML = listHtml || '<p>No links created yet</p>';
        }
      }
      
      // Load links on page load
      loadLinks();
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

// Handle create short link
async function handleCreateShortLink(request, env) {
  try {
    const { content, slug } = await request.json();

    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if content is URL or text
    let isUrl = false;
    let target = content;
    try {
      new URL(content);
      isUrl = true;
    } catch (e) {
      // Not a valid URL, treat as text
    }

    const isText = !isUrl;

    // Generate slug if not provided
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = generateSlug();
    }

    // Check if slug already exists
    const existing = await env.DB.prepare('SELECT id FROM links WHERE slug = ?')
      .bind(finalSlug)
      .first();

    if (existing) {
      return new Response(JSON.stringify({ error: 'Slug already exists, try another one' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert into database
    const stmt = env.DB.prepare(`
      INSERT INTO links (slug, target, is_text, created_at, clicks)
      VALUES (?, ?, ?, datetime('now'), 0)
    `);
    await stmt.bind(finalSlug, target, isText ? 1 : 0).run();

    const shortUrl = new URL(request.url).origin + '/' + finalSlug;

    return new Response(JSON.stringify({ shortUrl }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle admin login page
async function handleAdminLogin(request, env) {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Admin Login - Short Link Service</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        max-width: 400px;
        margin: 100px auto;
        padding: 20px;
        background-color: #f5f5f5;
      }
      .container {
        background-color: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      h1 {
        color: #333;
        text-align: center;
      }
      .form-group {
        margin-bottom: 20px;
      }
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      input[type="password"] {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        box-sizing: border-box;
      }
      button {
        background-color: #0070f3;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 5px;
        cursor: pointer;
        width: 100%;
        font-size: 16px;
      }
      button:hover {
        background-color: #0055cc;
      }
      .error {
        color: red;
        margin-top: 10px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Admin Login</h1>
      
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" placeholder="Enter admin password">
      </div>
      
      <button id="loginBtn">Login</button>
      
      <div id="error" class="error"></div>
    </div>

    <script>
      document.getElementById('loginBtn').addEventListener('click', async () => {
        const password = document.getElementById('password').value.trim();
        
        if (!password) {
          document.getElementById('error').innerText = 'Please enter a password';
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
          document.getElementById('error').innerText = result.error || 'Login failed';
        }
      });
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

// Handle admin dashboard
async function handleAdminDashboard(request, env) {
  // In a real implementation, we would check authentication (cookie, etc)
  // For now, we'll just show the dashboard

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Admin Dashboard - Short Link Service</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
      }
      .header {
        background-color: #333;
        color: white;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
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
      }
      .links-table th, .links-table td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
      .links-table th {
        background-color: #f8f9fa;
        font-weight: bold;
      }
      .links-table tr:hover {
        background-color: #f5f5f5;
      }
      .short-link {
        font-weight: bold;
        color: #0070f3;
      }
      .long-link {
        color: #666;
        word-break: break-all;
      }
      .action-btn {
        background-color: #dc3545;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
      }
      .action-btn:hover {
        background-color: #c82333;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Admin Dashboard</h1>
      <button id="logoutBtn">Logout</button>
    </div>
    
    <div class="container">
      <h2>All Short Links</h2>
      <table class="links-table">
        <thead>
          <tr>
            <th>Short Link</th>
            <th>Original Content</th>
            <th>Type</th>
            <th>Clicks</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="linksTableBody">
          <!-- Links will be loaded here -->
        </tbody>
      </table>
    </div>

    <script>
      // Load all links
      async function loadLinks() {
        const response = await fetch('/admin/api/links');
        if (response.ok) {
          const links = await response.json();
          const tbody = document.getElementById('linksTableBody');
          
          tbody.innerHTML = links.map(link => 
            \`<tr>
              <td><a href="/\${link.slug}" target="_blank">\${link.slug}</a></td>
              <td>\${link.is_text ? 'TEXT' : link.target}</td>
              <td>\${link.is_text ? 'Text' : 'URL'}</td>
              <td>\${link.clicks}</td>
              <td>\${link.created_at}</td>
              <td><button class="action-btn" onclick="deleteLink(\${link.id})">Delete</button></td>
            </tr>\`
          ).join('');
        }
      }
      
      // Delete a link
      async function deleteLink(id) {
        if (!confirm('Are you sure you want to delete this link?')) {
          return;
        }
        
        const response = await fetch('/admin/api/links/' + id, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          loadLinks();
        } else {
          alert('Failed to delete link');
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

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}

// Handle admin login API
async function handleAdminLoginAPI(request, env) {
  try {
    const { password } = await request.json();

    // In a real implementation, we would check against a stored hash
    // For now, we'll use a simple check
    if (password === 'admin') { // This should be properly secured in production
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Invalid password' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// Handle admin API requests
async function handleAdminAPI(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Get all links
  if (path === '/admin/api/links') {
    const { results } = await env.DB.prepare('SELECT * FROM links ORDER BY created_at DESC').all();
    return new Response(JSON.stringify(results), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Delete a link
  const deleteMatch = path.match(/^\/admin\/api\/links\/(\d+)$/);
  if (request.method === 'DELETE' && deleteMatch) {
    const id = deleteMatch[1];
    await env.DB.prepare('DELETE FROM links WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  return new Response('Not Found', { status: 404 });
}

// Generate random slug
function generateSlug(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}