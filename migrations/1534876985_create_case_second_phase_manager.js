const deployWithDelegate = require('./support/deployWithDelegate')

let CaseSecondPhaseManager = artifacts.require("./CaseSecondPhaseManager.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()

    return deployWithDelegate(artifacts, deployer, CaseSecondPhaseManager).then((caseSecondPhaseManager) => {
      return caseSecondPhaseManager.initialize(registryInstance.address)
    })
  })
};
