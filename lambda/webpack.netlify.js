'use strict';

module.exports = {
  target: 'node',
  module: {
    rules: [
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.node', '.json'],
    modules: ["node_modules", "src"]
  },
  externals: [
    'electron'
  ]
}
