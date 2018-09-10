const deployWithDelegate = require('./support/deployWithDelegate')
let CaseScheduleManager = artifacts.require("./CaseScheduleManager.sol")

module.exports = function(deployer) {
  deployer.then(async () => {
    return deployWithDelegate(artifacts, deployer, CaseScheduleManager)
  })
};
