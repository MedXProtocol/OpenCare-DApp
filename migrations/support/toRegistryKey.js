import Web3 from 'web3'
var web3 = new Web3()

module.exports = function (string) {
  if (web3.utils) {
    return web3.utils.sha3(string)
  } else {
    return web3.sha3(string)
  }
}
