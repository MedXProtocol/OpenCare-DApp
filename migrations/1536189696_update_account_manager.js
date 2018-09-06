const deployAndRegister = require('./support/deployAndRegister')
const toRegistryKey = require('./support/toRegistryKey')

let AccountManager = artifacts.require("./AccountManager.sol")
let Registry = artifacts.require('./Registry.sol')

module.exports = function(deployer) {
  return deployAndRegister(deployer, AccountManager, Registry, 'AccountManagerTarget')
};
