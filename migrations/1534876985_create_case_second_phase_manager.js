const deployWithDelegate = require('./support/deployWithDelegate')
const CaseSecondPhaseManager = artifacts.require("./CaseSecondPhaseManager.sol");
const Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()

    return deployWithDelegate(artifacts, deployer, CaseSecondPhaseManager)
  })
};
