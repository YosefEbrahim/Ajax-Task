const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const BACKEND_HOST = '76.13.13.84';
const BACKEND_PORT = 5000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif'
};

const server = http.createServer((req, res) => {

    // 1. إعدادات CORS (السماح للجميع)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    // التعامل مع طلبات الـ OPTIONS
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

  
    let filePath = '.' + req.url.split('?')[0];
    if (filePath === './') filePath = './index.html'; // الصفحة الرئيسية

    const extname = String(path.extname(filePath)).toLowerCase();

    if (extname && mimeTypes[extname] && fs.existsSync(filePath)) {
        fs.readFile(filePath, (error, content) => {
            if (error) {
                res.writeHead(500);
                res.end('Error loading file');
            } else {
                res.writeHead(200, { 'Content-Type': mimeTypes[extname] });
                res.end(content, 'utf-8');
            }
        });
    } 
    else {
        console.log(` تحويل الطلب للسيرفر (Proxy): ${req.method} ${req.url}`);

        const options = {
            hostname: BACKEND_HOST,
            port: BACKEND_PORT,
            path: req.url,
            method: req.method,
            headers: req.headers
        };

        options.headers.host = `${BACKEND_HOST}:${BACKEND_PORT}`;

        const backendReq = http.request(options, (backendRes) => {
            res.writeHead(backendRes.statusCode, backendRes.headers);
            backendRes.pipe(res, { end: true }); 
        });

        backendReq.on('error', (e) => {
            console.error(` خطأ في الاتصال بالسيرفر: ${e.message}`);
            res.writeHead(502);
            res.end(`Bad Gateway: ${e.message}`);
        });

        req.pipe(backendReq, { end: true });
    }
});

server.listen(PORT, () => {
    console.log(` http://localhost:${PORT}`);
});