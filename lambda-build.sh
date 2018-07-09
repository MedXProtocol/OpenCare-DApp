#! /bin/sh

cd lambda && \
npm i && \
cd .. && \
netlify-lambda -c lambda/webpack.netlify.js build lambda
