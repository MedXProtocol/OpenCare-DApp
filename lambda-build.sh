#! /bin/sh

cd lambda && \
netlify-lambda -c webpack.netlify.js build .
