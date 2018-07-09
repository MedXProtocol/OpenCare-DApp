#! /bin/sh

truffle compile && \
npm run migrate -- --network rinkeby && \
./lambda-build.sh && \
cd dapp && npm ci && npm run build && cd ..
