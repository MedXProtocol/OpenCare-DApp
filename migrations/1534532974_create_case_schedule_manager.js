const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')

let CaseScheduleManager = artifacts.require("./CaseScheduleManager.sol");

module.exports = function(deployer, networkName) {
  return deployTargetAndDelegate(artifacts, deployer, CaseScheduleManager, networkName)
};
