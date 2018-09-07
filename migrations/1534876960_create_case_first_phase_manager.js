const deployWithDelegate = require('./support/deployWithDelegate')

let CaseFirstPhaseManager = artifacts.require("./CaseFirstPhaseManager.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()

    return deployWithDelegate(artifacts, deployer, CaseFirstPhaseManager).then((caseFirstPhaseManager) => {
    })
  })
};
