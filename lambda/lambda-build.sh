#! /bin/sh

NODE_ENV=production npm i && \
NODE_ENV=production netlify-lambda -c webpack.netlify.js build src
