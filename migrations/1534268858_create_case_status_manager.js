const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')

let CaseStatusManager = artifacts.require("./CaseStatusManager.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()
    return deployTargetAndDelegate(artifacts, deployer, CaseStatusManager).then((caseStatusManager) => {
    })
  })
};
