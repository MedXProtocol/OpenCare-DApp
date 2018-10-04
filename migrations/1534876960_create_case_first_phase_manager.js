const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
const CaseFirstPhaseManager = artifacts.require("./CaseFirstPhaseManager.sol");

module.exports = function(deployer, networkName) {
  return deployTargetAndDelegate(artifacts, deployer, CaseFirstPhaseManager, networkName)
};
