require('babel-register');
require('babel-polyfill');
// require('dotenv').config();

var HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: 1234
        },
        ropsten: {
            provider: function() {
                return new HDWalletProvider(process.env.HDWALLET_MNEMONIC, process.env.ROPSTEN_PROVIDER_URL);
            },
            network_id: 3,
            gas: 4683623,
            gasPrice: 10000000000
        },
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
