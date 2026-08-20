const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3005;
const DIR = __dirname;
const DATA_FILE = path.join(DIR, 'data', 'messages.json');

const mimeTypes = {
  '.mp4':  'video/mp4',
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.mpeg': 'audio/mpeg',
  '.mp3':  'audio/mpeg',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
};

function readMessages() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error reading messages:', e);
  }
  return [];
}

function writeMessages(messages) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing messages:', e);
  }
}

function getRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

const server = http.createServer((req, res) => {
  // Strip query strings
  let urlPath = req.url.split('?')[0].split('#')[0];

  // API Routes
  if (urlPath === '/api/messages') {
    if (req.method === 'GET') {
      const showAll = req.url.includes('all=true');
      const allMsgs = readMessages();
      const filtered = showAll ? allMsgs : allMsgs.filter(m => m.approved === true);
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end(JSON.stringify(filtered));
      return;
    }

    if (req.method === 'POST') {
      getRequestBody(req).then(data => {
        const { full_name, city_country, message } = data;
        if (!full_name || !message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Name and message are required' }));
          return;
        }

        const newMsg = {
          id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          full_name: full_name.trim(),
          city_country: (city_country || '').trim() || null,
          message: message.trim(),
          approved: false, // ALWAYS default to false (Pending admin approval)
          created_at: new Date().toISOString()
        };

        const allMsgs = readMessages();
        allMsgs.unshift(newMsg);
        writeMessages(allMsgs);

        res.writeHead(200, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ success: true, message: 'Reflection submitted for admin approval', data: newMsg }));
      });
      return;
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return;
    }
  }

  if (urlPath === '/api/admin/approve' && req.method === 'POST') {
    getRequestBody(req).then(data => {
      const { id } = data;
      const allMsgs = readMessages();
      const target = allMsgs.find(m => String(m.id) === String(id));
      if (target) {
        target.approved = true;
        writeMessages(allMsgs);
      }
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  if (urlPath === '/api/admin/delete' && req.method === 'POST') {
    getRequestBody(req).then(data => {
      const { id } = data;
      let allMsgs = readMessages();
      allMsgs = allMsgs.filter(m => String(m.id) !== String(id));
      writeMessages(allMsgs);
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  // Default to index.html
  if (urlPath === '/') urlPath = '/index.html';

  // Admin route - serve /admin/index.html
  if (urlPath === '/admin' || urlPath === '/admin/') urlPath = '/admin/index.html';

  // Clean URL rewrites for chapters
  if (/^\/(before-the-fire|the-path-of-vayu|chess|vayu-mahesh)\/chapter-\d+/.test(urlPath)) {
    urlPath = '/chapters' + urlPath;
  }
  if (/^\/(before-the-fire|the-path-of-vayu|chess|vayu-mahesh)\/?$/.test(urlPath)) {
    const bookName = urlPath.replace(/\//g, '');
    urlPath = `/chapters/${bookName}/chapter-1/index.html`;
  }

  // Decode percent-encoded characters (spaces etc.)
  let filePath;
  try {
    filePath = path.join(DIR, decodeURIComponent(urlPath));
  } catch (e) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  // Security: prevent path traversal
  if (!filePath.startsWith(DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Handle directory requests by trying index.html inside directory
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      const dirIndex = path.join(filePath, 'index.html');
      if (fs.existsSync(dirIndex) && fs.statSync(dirIndex).isFile()) {
        filePath = dirIndex;
      }
    }
  } catch (e) {}

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  // If no extension, try adding .html
  if (!ext) {
    const withHtml = filePath + '.html';
    try {
      if (fs.existsSync(withHtml) && fs.statSync(withHtml).isFile()) {
        filePath = withHtml;
      }
    } catch (e) {}
  }

  const finalExt = path.extname(filePath).toLowerCase();
  const finalContentType = mimeTypes[finalExt] || 'application/octet-stream';

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      console.log('404:', urlPath);
      const page404 = path.join(DIR, '404.html');
      if (fs.existsSync(page404)) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        fs.createReadStream(page404).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found: ' + urlPath);
      }
      return;
    }

    console.log('Serving:', urlPath, '(' + stat.size + ' bytes)');

    // Video range support
    const range = req.headers.range;
    if (range && (finalExt === '.mp4' || finalExt === '.mpeg' || finalExt === '.mp3')) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        'Content-Range':  `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges':  'bytes',
        'Content-Length': chunkSize,
        'Content-Type':   finalContentType,
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Type':   finalContentType,
        'Content-Length': stat.size,
        'Cache-Control':  'no-cache',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Server running at http://localhost:${PORT}`);
  console.log(`🌐 Also try: http://127.0.0.1:${PORT}`);
  console.log(`📁 Serving files from: ${DIR}\n`);
});
