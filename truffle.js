require('babel-register')
require('babel-polyfill')

var HDWalletProvider = require("truffle-hdwallet-provider")

module.exports = {
  networks: {
    test: {
      host: '0.0.0.0',
      port: 8545,
      network_id: 1234,
      gas: 4700000,
      gasPrice: 60 * 1000000000
    },
    development: {
      host: 'localhost',
      port: 8545,
      network_id: 1234,
      gas: 4700000,
      gasPrice: 60 * 1000000000
    },
    ropsten: {
      provider: () => new HDWalletProvider(process.env.HDWALLET_MNEMONIC, process.env.REACT_APP_ROPSTEN_PROVIDER_URL),
      network_id: 3,
      gas: 4700000,
      gasPrice: 60 * 1000000000
    },
    rinkeby: {
      provider: () => new HDWalletProvider(process.env.HDWALLET_MNEMONIC, process.env.REACT_APP_RINKEBY_PROVIDER_URL),
      network_id: 4,
      gas: 4700000,
      gasPrice: 60 * 1000000000
    },
    mainnet: {
      provider: () => new HDWalletProvider(process.env.HDWALLET_MNEMONIC, process.env.REACT_APP_MAINNET_PROVIDER_URL),
      network_id: 1,
      gas: 4700000,
      gasPrice: 10 * 1000000000
    }
  },
  // mocha: {
  //   reporter: 'eth-gas-reporter',
  //   reporterOptions : {
  //     currency: 'CAD',
  //     gasPrice: 21
  //   }
  // }
}
