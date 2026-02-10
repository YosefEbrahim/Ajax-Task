const http = require("http");
const fs = require("fs");
const path = require("path");

const FRONTEND_PORT = 8000;
const BACKEND_HOST = "76.13.13.84";
const BACKEND_PORT = 5000;

const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".woff": "application/font-woff",
  ".ttf": "application/font-ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "application/font-otf",
  ".wasm": "application/wasm",
};

http.createServer((req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  let filePath = "." + req.url.split("?")[0];
  if (filePath === "./") filePath = "./index.html";

  const extname = path.extname(filePath).toLowerCase();

  // Serve static files
  if (extname && mimeTypes[extname] && fs.existsSync(filePath)) {
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end("Error loading file");
      } else {
        res.writeHead(200, { "Content-Type": mimeTypes[extname] });
        res.end(content);
      }
    });
    return;
  }

  // Proxy to backend
  const backendReq = http.request(
    {
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${BACKEND_HOST}:${BACKEND_PORT}`,
      },
    },
    (backendRes) => {
      res.writeHead(backendRes.statusCode, backendRes.headers);
      backendRes.pipe(res);
    }
  );

  backendReq.on("error", (e) => {
    console.error("Backend Error:", e.message);
    res.writeHead(502);
    res.end("Bad Gateway");
  });

  req.pipe(backendReq);
}).listen(FRONTEND_PORT);

console.log(`Proxy running at http://localhost:${FRONTEND_PORT}`);
