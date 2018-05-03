#! /bin/sh
mkdir -p .ganache
ganache-cli --db .ganache -i 1234 -e 100 -a 10 -u 0 -m "$HDWALLET_MNEMONIC"
