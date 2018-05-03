#! /bin/sh

truffle compile && \
if [ "$BRANCH" == "master" ]
then
  truffle-migrate-off-chain --network ropsten
fi
npm run build
