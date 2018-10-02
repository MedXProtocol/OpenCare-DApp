const updateDeployedTargetContract = require('./support/updateDeployedTargetContract')
const toRegistryKey = require('./support/toRegistryKey')
const Registry = artifacts.require('Registry.sol')
const CaseScheduleManager = artifacts.require('CaseScheduleManager')

module.exports = function(deployer) {
  return updateDeployedTargetContract(deployer, artifacts, 'CaseScheduleManager').then(async () => {
    const registry = await Registry.deployed()
    const csmAddress = await registry.lookup(toRegistryKey('CaseScheduleManager'))
    const csm = await CaseScheduleManager.at(csmAddress)
    await csm.setSecondsInADay(86400)
  })
};
