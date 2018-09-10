const deployAndRegister = require('./support/deployAndRegister')
const toRegistryKey = require('./support/toRegistryKey')

let CaseLifecycleManager = artifacts.require("./CaseLifecycleManager.sol")
let Registry = artifacts.require('./Registry.sol')

module.exports = function(deployer) {
  return deployAndRegister(deployer, CaseLifecycleManager, Registry, 'CaseLifecycleManagerTarget')
};
