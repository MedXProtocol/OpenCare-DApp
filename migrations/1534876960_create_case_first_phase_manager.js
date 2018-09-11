const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')

let CaseFirstPhaseManager = artifacts.require("./CaseFirstPhaseManager.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()

    return deployTargetAndDelegate(artifacts, deployer, CaseFirstPhaseManager).then((caseFirstPhaseManager) => {
    })
  })
};
