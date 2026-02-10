const http = require('http');

// Create a simple proxy server
const proxy = http.createServer((req, res) => {

  // Step 1: Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Step 2: Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Step 3: Forward request to real API
  const backendReq = http.request({
    hostname: '76.13.13.84', // Replace with your API IP
    port: 5000,               // Replace with your API port
    path: req.url,            // Keep the same path requested by browser
    method: req.method,
    headers: req.headers
  }, backendRes => {

    // Step 4: Forward backend response back to browser
    res.writeHead(backendRes.statusCode, {
      ...backendRes.headers,
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': '*'
    });

    backendRes.pipe(res); // pipe backend response
  });

  // Step 5: Pipe browser request body to backend
  req.pipe(backendReq);

});

// Step 6: Listen on localhost:8000
proxy.listen(8000, () => {
  console.log('Proxy running on http://localhost:8000');
});
