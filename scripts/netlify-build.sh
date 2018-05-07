#! /bin/sh

truffle compile
truffle-migrate-off-chain --network ropsten
cd dapp && npm install && npm run build && cd ..
