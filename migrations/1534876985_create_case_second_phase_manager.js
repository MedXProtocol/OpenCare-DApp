const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
const CaseSecondPhaseManager = artifacts.require("./CaseSecondPhaseManager.sol");
const Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()

    return deployTargetAndDelegate(artifacts, deployer, CaseSecondPhaseManager)
  })
};
