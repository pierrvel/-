const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Local Sync API endpoint
  if (reqPath === '/api/sync') {
    const dataFilePath = path.join(__dirname, 'sync_data.json');
    if (req.method === 'GET') {
      const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const code = urlObj.searchParams.get('code') || 'DEFAULT';
      try {
        if (fs.existsSync(dataFilePath)) {
          const raw = fs.readFileSync(dataFilePath, 'utf8');
          const allData = JSON.parse(raw);
          const roomData = allData[code] || null;
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, data: roomData }));
          return;
        }
      } catch (e) {}
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, data: null }));
      return;
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          const code = payload.code || 'DEFAULT';
          let allData = {};
          if (fs.existsSync(dataFilePath)) {
            try { allData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8')); } catch(e) {}
          }
          allData[code] = payload;
          fs.writeFileSync(dataFilePath, JSON.stringify(allData, null, 2), 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true }));
        } catch(e) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
      return;
    }
  }

  // Secure static file serving with path traversal protection
  let normalizedRelPath = path.normalize(reqPath === '/' ? 'index.html' : reqPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.resolve(__dirname, normalizedRelPath);

  // Prevent directory traversal outside root directory
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  // Block access to sensitive files (hidden files, git data, batch scripts, sync data)
  const baseName = path.basename(filePath);
  if (baseName.startsWith('.') || filePath.includes('.git') || filePath.endsWith('.bat') || baseName.includes('sync_data')) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    let contentType = 'text/html; charset=utf-8';
    if (filePath.endsWith('.css')) contentType = 'text/css';
    if (filePath.endsWith('.js')) contentType = 'text/javascript';
    if (filePath.endsWith('.json')) contentType = 'application/json';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

const localIp = getLocalIp();

server.listen(PORT, '0.0.0.0', () => {
  console.log('========================================================');
  console.log('🔥 중간고사 플래너 로컬 공유 서버가 시작되었습니다!');
  console.log('========================================================');
  console.log(`💻 PC 브라우저 접속 주소:   http://localhost:${PORT}`);
  console.log(`📱 폰 / 패드 접속 주소:     http://${localIp}:${PORT}`);
  console.log('========================================================');
  console.log('💡 폰과 아이패드에서 위 주소로 접속하면 완벽하게 동일한 플래너를 사용하실 수 있습니다.');
  console.log('💡 창을 닫으려면 Ctrl + C 를 누르세요.');
});
