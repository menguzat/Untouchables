const path = require("path");
const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    host: '192.168.50.192', // replace with your IPv4 address
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    liveReload: true,
    port: 8080,
  },
  
});