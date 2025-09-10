module.exports = {
  devServer: {
    host: '0.0.0.0',
    port: 8081,
    https: false,
    proxy: {
      '/api': {
        target: 'http://169.254.43.131:8041', // 改为 HTTP
        changeOrigin: true,
        secure: false, // 不需要 HTTPS 时可忽略
        pathRewrite: {
          '^/api': ''
        },
        ws: true
      }
    }
  },
  lintOnSave: false
};