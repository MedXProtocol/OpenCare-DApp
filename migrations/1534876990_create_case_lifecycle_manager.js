const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
const CaseLifecycleManager = artifacts.require("./CaseLifecycleManager.sol");
const Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()

    return deployTargetAndDelegate(artifacts, deployer, CaseLifecycleManager)
  })
};
