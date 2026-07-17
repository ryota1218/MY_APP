const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('url');

const server = http.createServer(async (req, res) => {
  const parsedUrl = parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Vercel環境と同等のレスポンスヘルパーを追加
  res.status = function(code) {
    this.statusCode = code;
    return this;
  };
  res.json = function(data) {
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify(data));
  };
  res.send = function(data) {
    this.end(data);
  };

  // APIルートの処理
  if (pathname.startsWith('/api/')) {
    const apiPath = path.join(__dirname, pathname + (pathname.endsWith('.js') ? '' : '.js'));
    if (fs.existsSync(apiPath)) {
      try {
        // リクエストボディのパース
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        await new Promise(resolve => req.on('end', resolve));
        
        if (body && req.headers['content-type'] === 'application/json') {
          try { req.body = JSON.parse(body); } catch(e) { req.body = body; }
        } else if (body) {
          req.body = body;
        }

        req.query = parsedUrl.query;
        req.cookies = {};
        if (req.headers.cookie) {
            req.headers.cookie.split(';').forEach(c => {
                const parts = c.split('=');
                req.cookies[parts[0].trim()] = parts.slice(1).join('=');
            });
        }

        const handler = require(apiPath);
        
        // CSRF Verification
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
          const csrfHeader = req.headers['x-csrf-token'];
          const csrfCookie = req.cookies['csrf_token'];
          if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
            res.status(403).json({ error: 'CSRF token validation failed' });
            return;
          }
        }

        await handler(req, res);
      } catch (err) {
        console.error('API Error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
      }
      return;
    }
  }

  // 静的ファイルの処理
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(__dirname, pathname);
  
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    
    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };
    
    res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    fs.createReadStream(filePath).pipe(res);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Local dev server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser.`);
});
