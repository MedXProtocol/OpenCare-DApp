const deployAndRegister = require('./support/deploy-and-register')
const toRegistryKey = require('./support/to-registry-key')

let AccountManager = artifacts.require("./AccountManager.sol")
let Registry = artifacts.require('./Registry.sol')

module.exports = function(deployer) {
  return deployAndRegister(deployer, AccountManager, Registry, 'AccountManagerTarget')
};
