const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3004;
const DIR = __dirname;

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

const server = http.createServer((req, res) => {
  // Strip query strings
  let urlPath = req.url.split('?')[0].split('#')[0];

  // Default to index.html
  if (urlPath === '/') urlPath = '/index.html';

  // Admin route - serve admin.html
  if (urlPath === '/admin' || urlPath === '/admin/') urlPath = '/admin.html';

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
      res.writeHead(404);
      res.end('Not found: ' + urlPath);
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
