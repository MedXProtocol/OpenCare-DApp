#! /bin/sh

truffle compile && \
npm run migrate -- --network rinkeby && \
./lambda-build.sh && \
cd dapp && npm install && npm run build && cd ..
