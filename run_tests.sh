truffle compile && \
  docker stop ganache && \
  docker rm ganache && \
  docker run -d --name ganache -p 8545:8545 trufflesuite/ganache-cli:latest -e 100000000000 -l 4700038 && \
  truffle test --network=test
