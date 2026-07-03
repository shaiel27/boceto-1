const { createProxyMiddleware } = require('http-proxy-middleware');

const PROXY_OPTS = {
  target: 'http://localhost:8000',
  changeOrigin: true,
  timeout: 120000,
};

module.exports = function (app) {
  app.use('/api/bienes', createProxyMiddleware(PROXY_OPTS));
  app.use('/api/unidades', createProxyMiddleware(PROXY_OPTS));
  app.use('/api/office', createProxyMiddleware(PROXY_OPTS));
};
