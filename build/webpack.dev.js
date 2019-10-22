/**
 * @file 开发配置
 * @author atom-yang
 */

/* eslint-env node */
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base');
const path = require('path');
const http = require('http');
const mockMapper = require('./mock.json');
const {OUTPUT_PATH} = require('./util');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const minimist = require('minimist');
const proxy = require('./proxy.json');
const {isObject} = require('lodash');

const defaultTargetOptions = {
  // dev-mode, 开发方式，local - 本地mock开发，test - 联调开发
  string: ['dev-mode'],
  default: {
    'dev-mode': 'local'
  }
};
const args = minimist(process.argv.slice(2), defaultTargetOptions);
const devMode = args['dev-mode'];

const proxyServer = devMode === 'local' ? {} : proxy.map(v => {
  return {
    context: v.context,
    target: v.target,
    changeOrigin: true,
    secure: false,
    proxyTimeout: 8000,
    agent: http.globalAgent,
    onProxyReq(proxyReq) {
      const headers = v.headers;
      Object.keys(headers).forEach(v => {
        proxyReq.setHeader(v, headers[v]);
      });
    }
  };
});


const devConfig = {
  mode: 'development',
  devtool: 'eval-source-map',
  output: {
    filename: '[name].js'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ],
  devServer: {
    disableHostCheck: true,
    contentBase: OUTPUT_PATH,
    host: '0.0.0.0',
    port: 9527,
    compress: true,
    hot: false,
    inline: false,
    historyApiFallback: true,
    proxy: proxyServer,
    before(app) {
      app.all('*', (req, res, next) => {
        let mockFile = mockMapper[req.path];
        if (isObject(mockFile)) {
          mockFile = mockFile[req.query.path];
        }
        if (mockFile && devMode === 'local') {
          res.sendFile(path.resolve(__dirname, mockFile), {
            headers: {
              'Content-Type': 'application/json; charset=utf-8'
            }
          }, err => {
            err && console.error(err);
          });
        } else {
          next();
        }
      });
    }
  }
};

module.exports = merge(baseConfig, devConfig);
