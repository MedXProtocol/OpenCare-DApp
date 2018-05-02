require('babel-register');
require('babel-polyfill');
require('dotenv').config();

var HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 9545,
            network_id: "*" // Match any network id
        },
        ropsten: {
            provider: function() {
                return new HDWalletProvider(process.env.ROPSTEN_MNEMONIC, "https://ropsten.infura.io/" + process.env.INFURA_API_KEY);
            },
            network_id: 3,
            gas: 3000000
        },
        mainnet: {
            provider: function() {
                return new HDWalletProvider(process.env.MAINNET_MNEMONIC, "https://mainnet.infura.io/" + process.env.INFURA_API_KEY);
            },
            gas: 3000000,
            gasPrice: 21000000000,
            network_id: "1"
        }

    }
};
