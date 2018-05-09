#! /bin/sh
watchman-make -p 'contracts/**' 'test/**' --make=truffle -t "compile && truffle test $1"
