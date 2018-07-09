#! /bin/sh

truffle compile && \
npm run migrate -- --network ropsten && \
./lambda-build.sh && \
cd dapp && npm install && npm run build && cd ..
