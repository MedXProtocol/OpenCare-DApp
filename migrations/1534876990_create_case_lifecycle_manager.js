const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
const CaseLifecycleManager = artifacts.require("./CaseLifecycleManager.sol");

module.exports = function(deployer, networkName) {
  return deployTargetAndDelegate(artifacts, deployer, CaseLifecycleManager, networkName)
};
