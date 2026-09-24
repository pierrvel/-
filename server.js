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
  let filePath = path.join(__dirname, reqPath === '/' ? 'index.html' : reqPath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    let contentType = 'text/html; charset=utf-8';
    if (filePath.endsWith('.css')) contentType = 'text/css';
    if (filePath.endsWith('.js')) contentType = 'text/javascript';

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
