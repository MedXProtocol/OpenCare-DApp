const deployWithDelegate = require('./support/deployWithDelegate')
const CaseFirstPhaseManager = artifacts.require("./CaseFirstPhaseManager.sol");
const Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()

    return deployWithDelegate(artifacts, deployer, CaseFirstPhaseManager)
  })
};
