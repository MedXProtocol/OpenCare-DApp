#! /bin/sh

npm run compile && \
cd lambda && \
./lambda-build.sh && \
cd .. && \
cd dapp && npm i && node --max-old-space-size=4096 scripts/build.js && cd ..
