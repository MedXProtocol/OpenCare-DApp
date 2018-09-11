const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')

let CaseLifecycleManager = artifacts.require("./CaseLifecycleManager.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()

    return deployTargetAndDelegate(artifacts, deployer, CaseLifecycleManager).then((caseLifecycleManager) => {
    })
  })
};
