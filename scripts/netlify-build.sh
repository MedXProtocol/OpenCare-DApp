#! /bin/sh

truffle compile && \
if [ "$BRANCH" == "develop" ]
then
  truffle-migrate-off-chain --network ropsten
fi
cd dapp && npm run build && cd ..
