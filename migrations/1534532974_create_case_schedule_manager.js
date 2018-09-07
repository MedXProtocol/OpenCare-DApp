const deployWithDelegate = require('./support/deployWithDelegate')

let CaseScheduleManager = artifacts.require("./CaseScheduleManager.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()
    return deployWithDelegate(artifacts, deployer, CaseScheduleManager).then((caseScheduleManager) => {
    })
  })
};
