#! /bin/sh

truffle compile && \
npm run migrate -- --network ropsten && \
cd dapp && npm install && npm run build && cd ..
