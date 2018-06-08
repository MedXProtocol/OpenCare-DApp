require('babel-register');
require('babel-polyfill');

var HDWalletProvider = require("truffle-hdwallet-provider");

var ropstenProvider = new HDWalletProvider(process.env.HDWALLET_MNEMONIC, process.env.ROPSTEN_PROVIDER_URL);
var rinkebyProvider = new HDWalletProvider(process.env.HDWALLET_MNEMONIC, process.env.ROPSTEN_PROVIDER_URL);

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: 1234
    },
    ropsten: {
      provider: ropstenProvider,
      network_id: 3,
      gas: 4683623,
      gasPrice: 20 * 1000000000
    },
    rinkeby: {
      provider: rinkebyProvider,
      network_id: 4,
      gas: 4683623,
      gasPrice: 20 * 1000000000
    }
    // mainnet: {
    //     provider: function() {
    //         return new HDWalletProvider(process.env.MAINNET_MNEMONIC, "https://mainnet.infura.io/" + process.env.INFURA_API_KEY);
    //     },
    //     gas: 3000000,
    //     gasPrice: 21000000000,
    //     network_id: "1"
    // }
  }
};
