const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
let CaseScheduleManager = artifacts.require("./CaseScheduleManager.sol")

module.exports = function(deployer) {
  deployer.then(async () => {
    return deployTargetAndDelegate(artifacts, deployer, CaseScheduleManager)
  })
};
