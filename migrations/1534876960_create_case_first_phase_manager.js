const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
const CaseFirstPhaseManager = artifacts.require("./CaseFirstPhaseManager.sol");
const Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()

    return deployTargetAndDelegate(artifacts, deployer, CaseFirstPhaseManager)
  })
};
