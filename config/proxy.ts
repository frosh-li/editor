/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
export default {
  dev: {
    '/api/': {
      target: 'http://127.0.0.1:7001',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/socket.io/': {
      target: 'ws://127.0.0.1:7001',//后端目标接口地址
      changeOrigin: true,//是否允许跨域
      pathRewrite: {
        '^': '',//重写,
      },
      ws: true //开启ws, 如果是http代理此处可以不用设置
    }
  },
  test: {
    '/api/': {
      target: 'https://preview.pro.ant.design',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
