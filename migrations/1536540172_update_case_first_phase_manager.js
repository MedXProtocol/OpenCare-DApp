const deployAndRegister = require('./support/deployAndRegister')
const toRegistryKey = require('./support/toRegistryKey')

let CaseFirstPhaseManager = artifacts.require("./CaseFirstPhaseManager.sol")
let Registry = artifacts.require('./Registry.sol')

module.exports = function(deployer) {
  return deployAndRegister(deployer, CaseFirstPhaseManager, Registry, 'CaseFirstPhaseManagerTarget')
};
