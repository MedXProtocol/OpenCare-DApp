#! /bin/sh

truffle compile && \
npm run migrate -- --network rinkeby && \
cd lambda && \
./lambda-build.sh && \
cd .. && \
cd dapp && npm install && npm run build && cd ..
