'use strict';

var path = require('path')

module.exports = {
  // module: {
    // rules: [
    //   {
    //     test: /\.node$/,
    //     exclude: /(node_modules|bower_components)/,
    //     use: {
    //       loader: "babel-loader"
    //     }
    //   }
    // ]
  // },
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
    modules: ["node_modules"],
  },
  externals: [
    'electron'
  ],
  plugins: [
  ]
}
