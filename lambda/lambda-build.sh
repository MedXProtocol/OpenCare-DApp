#! /bin/sh

npm i && \
netlify-lambda -c webpack.netlify.js build src
