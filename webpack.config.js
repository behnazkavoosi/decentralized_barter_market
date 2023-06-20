const path = require('path');

module.exports = {
  mode: 'development',
  entry:{ 'bundle': path.resolve(__dirname, './client/index.js'),
          'create': path.resolve(__dirname, './client/create_user.js')},
  output: {
    path: path.resolve(__dirname, '/public'),
    filename: '[name].js', // string
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 8080
  }
};
