var deployAndRegister = require('./support/deploy-and-register')

let AccountManager = artifacts.require("./AccountManager.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  return deployAndRegister(deployer, AccountManager, Registry, 'AccountManagerTarget')
};
