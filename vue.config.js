module.exports = {
  devServer: {
    host: '0.0.0.0',
    port: 8081,
    https: false,
    proxy: {
      '/api': {
        target: 'http://169.254.43.131:8041', // 目标后端地址
        changeOrigin: true,
        secure: false, // 不需要 HTTPS 时设置为 false
        pathRewrite: {
          '^/api': ''
        },
        ws: true,
        timeout: 60000, // 增加超时时间到 60 秒
        headers: {
          Connection: 'keep-alive'
        },
        // 配置代理拦截器，如果代理失败则返回mock数据
        onProxyReq: function(proxyReq, req, res) {
          // 这里可以添加请求前的处理逻辑
        },
        onError: function(err, req, res) {
          // 代理错误处理 - 对于登录请求返回mock数据
          // 注意：由于pathRewrite，这里的路径已经是重写后的路径
          if (req.path === '/login' && req.method === 'POST') {
            console.log('Proxy error, returning mock login data');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            // 模拟登录成功响应
            const mockResponse = {
              code: 200,
              message: '登录成功',
              data: {
                token: 'mock-jwt-token-123456',
                userId: 1
              }
            };
            res.end(JSON.stringify(mockResponse));
          } else {
            // 确保对其他请求也结束响应，防止挂起
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ code: 500, message: 'Proxy error' }));
          }
        }
      }
    },
    // 添加before钩子来处理其他需要mock的请求
    before: function(app) {
      // 模拟获取区块链地址的接口
      app.get('/contract/user/:userId/blockchain-address', function(req, res) {
        const userId = req.params.userId;
        res.json({
          code: 200,
          data: {
            blockchainAddress: '0xMockAddress' + userId
          }
        });
      });
    }
  },
  lintOnSave: false
};