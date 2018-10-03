while [ $(docker ps -q -f "name=ganache-cli") ]
do
  echo 'Waiting for old docker instance to shutdown...'
  sleep 1
done
docker run --rm -it -d --name ganache-cli -p 8145:8545 trufflesuite/ganache-cli:latest -e 10000000000 -l 4700038 -h 0.0.0.0 -i 9999 ; \
npm run compile && \
truffle test --network=test $1; \
EXIT_STATUS=$?; \
rm -f networks/9999.json \
echo 'Shutting down ganache-cli...'; \
docker stop ganache-cli && echo 'Shut down ganache-cli' & \
exit $EXIT_STATUS
