require('babel-register')
require('babel-polyfill')

var HDWalletProvider = require("truffle-hdwallet-provider")

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: 1234,
      gas: 4700000,
      gasPrice: 60 * 1000000000
    },
    ropsten: {
      provider: () => new HDWalletProvider(process.env.HDWALLET_MNEMONIC, process.env.ROPSTEN_PROVIDER_URL),
      network_id: 3,
      gas: 4700000,
      gasPrice: 60 * 1000000000
    },
    rinkeby: {
      provider: () => new HDWalletProvider(process.env.HDWALLET_MNEMONIC, process.env.RINKEBY_PROVIDER_URL),
      network_id: 4,
      gas: 4700000,
      gasPrice: 10 * 1000000000
    }
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions : {
      currency: 'CAD',
      gasPrice: 21
    }
  }
}
