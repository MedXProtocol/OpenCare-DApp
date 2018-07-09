#! /bin/sh

truffle compile && \
npm run migrate -- --network ropsten && \
./lambda-build.sh && \
cd dapp && npm ci && npm run build && cd ..
