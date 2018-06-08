#! /bin/sh

truffle compile && \
cd dapp && npm install && npm run build && cd ..
