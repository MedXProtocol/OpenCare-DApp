const deployWithDelegate = require('./support/deployWithDelegate')

let CaseLifecycleManager = artifacts.require("./CaseLifecycleManager.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()

    return deployWithDelegate(artifacts, deployer, CaseLifecycleManager).then((caseLifecycleManager) => {
      return caseLifecycleManager.initialize(registryInstance.address)
    })
  })
};
