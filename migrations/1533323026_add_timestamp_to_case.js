var deployAndRegister = require('./support/deploy-and-register')

let Case = artifacts.require("./Case.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployAndRegister(deployer, Case, Registry, 'Case')
};
