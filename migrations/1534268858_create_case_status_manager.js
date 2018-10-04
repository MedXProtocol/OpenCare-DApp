const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')

let CaseStatusManager = artifacts.require("./CaseStatusManager.sol");

module.exports = function(deployer, networkName) {
  return deployTargetAndDelegate(artifacts, deployer, CaseStatusManager, networkName)
};
