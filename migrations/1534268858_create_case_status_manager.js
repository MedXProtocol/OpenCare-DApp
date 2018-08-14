const deployWithDelegate = require('./support/deployWithDelegate')

let CaseStatusManager = artifacts.require("./CaseStatusManager.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()
    return deployWithDelegate(artifacts, deployer, CaseStatusManager).then((caseStatusManager) => {
      return caseStatusManager.initialize(registryInstance.address)
    })
  })
};
