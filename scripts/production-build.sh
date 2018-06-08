#! /bin/sh

truffle compile && \
npm run migrate -- --network rinkeby && \
cd dapp && npm install && npm run build && cd ..
