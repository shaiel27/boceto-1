const http = require('http');

const PHP_HOST = 'localhost';
const PHP_PORT = 8012;

function proxyRequest(prefix, phpPath) {
  return (req, res) => {
    const query = req.url.includes('?')
      ? req.url.substring(req.url.indexOf('?'))
      : '';

    const options = {
      hostname: PHP_HOST,
      port: PHP_PORT,
      path: phpPath + query,
      method: 'GET',
      headers: { Accept: 'application/json' },
      timeout: 120000,
    };

    console.log('[bienes] -> http://' + PHP_HOST + options.path);

    const proxyReq = http.request(options, (proxyRes) => {
      console.log('[bienes] <- HTTP ' + proxyRes.statusCode);

      let body = '';
      proxyRes.on('data', (chunk) => {
        body += chunk;
      });
      proxyRes.on('end', () => {
        res.writeHead(proxyRes.statusCode, {
          'Content-Type': 'application/json; charset=utf-8',
        });
        res.end(body);
      });
    });

    proxyReq.on('error', (err) => {
      console.error('[bienes] Error:', err.message);
      if (!res.headersSent) {
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
        });
        res.end(
          JSON.stringify({
            total: 0,
            page: 1,
            limit: 12,
            results: [],
            error: 'XAMPP no disponible: ' + err.message,
          })
        );
      }
    });

    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      console.error('[bienes] Timeout');
      if (!res.headersSent) {
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
        });
        res.end(
          JSON.stringify({
            total: 0,
            page: 1,
            limit: 12,
            results: [],
            error: 'Timeout conectando a XAMPP',
          })
        );
      }
    });

    proxyReq.end();
  };
}

module.exports = function (app) {
  app.use('/api/bienes', proxyRequest('/bienes', '/bienes/bienes.php'));
  app.use('/api/unidades', proxyRequest('/unidades', '/bienes/unidades.php'));
};
