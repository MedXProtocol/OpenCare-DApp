#! /bin/sh

truffle compile && \
npm run migrate -- --network rinkeby && \
cd lambda && \
./lambda-build.sh && \
cd .. && \
cd dapp && npm i && node --max-old-space-size=4096 scripts/build.js  && cd ..
