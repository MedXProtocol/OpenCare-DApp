require('babel-register');
require('babel-polyfill');

var HDWalletProvider = require("truffle-hdwallet-provider");

var infura_apikey = "To0546l6M9AapR2JxoHN";
var mnemonic = "remember type toddler wage nothing will food brick into siren sorry lawn";

module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*" // Match any network id
        },
        ropsten: {
          provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"+infura_apikey),
          network_id: 3,
          gas: 3000000
        }
    }
};
