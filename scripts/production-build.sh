#! /bin/sh

DIR=`dirname "$0"`

$DIR/default-build.sh && \
npm run migrate -- --network rinkeby
