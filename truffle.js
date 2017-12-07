var HDWalletProvider = require("truffle-hdwallet-provider");
require('babel-register');
require('babel-polyfill');
require('dotenv').config();

module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*" // Match any network id
        },
        ropsten: {
            provider: function() {
                return new HDWalletProvider(process.env.ROPSTEN_MNEMONIC, "https://ropsten.infura.io/GC0NQf10QgUudzUe5B54")
            },
            gas: 4600000,
            gasPrice: 21000000000,
            network_id: "3"
        },
    }
};
