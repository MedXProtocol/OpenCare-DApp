import Web3 from 'web3'
var web3 = new Web3()

module.exports = function (string) {
  return web3.sha3(string)
}
