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

http
  .createServer((req, res) => {
    // Handle CORS preflight
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Request-Method", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "OPTIONS, GET, POST, PUT, DELETE",
    );
    res.setHeader("Access-Control-Allow-Headers", "*");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    let filePath = "." + req.url.split("?")[0];
    if (filePath === "./") filePath = "./index.html";

    const extname = String(path.extname(filePath)).toLowerCase();

    // Check if it's a known static file type. If so, serve it.
    if (extname && mimeTypes[extname] && fs.existsSync(filePath)) {
      fs.readFile(filePath, (error, content) => {
        if (error) {
          res.writeHead(500);
          res.end("Error loading file");
        } else {
          res.writeHead(200, { "Content-Type": mimeTypes[extname] });
          res.end(content, "utf-8");
        }
      });
    } else {
      // PROXY TO BACKEND
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
          backendRes.pipe(res, { end: true });
        },
      );

      backendReq.on("error", (e) => {
        console.error(`Backend Error: ${e.message}`);
        res.writeHead(502);
        res.end(`Bad Gateway: ${e.message}`);
      });

      // Log data flow for debugging
      let bodySize = 0;
      req.on("data", (chunk) => {
        bodySize += chunk.length;
        backendReq.write(chunk);
      });

      req.on("end", () => {
        console.log(
          `[Proxy] ${req.method} ${req.url} -> Backend (Sent ${bodySize} bytes body)`,
        );
        backendReq.end();
      });
    }
  })
  .listen(FRONTEND_PORT);

console.log(`Proxy Server running at http://localhost:${FRONTEND_PORT}`);
console.log(
  `Forwarding API requests to http://${BACKEND_HOST}:${BACKEND_PORT}`,
);
