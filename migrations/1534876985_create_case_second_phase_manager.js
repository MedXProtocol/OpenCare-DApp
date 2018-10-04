const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
const CaseSecondPhaseManager = artifacts.require("./CaseSecondPhaseManager.sol");

module.exports = function(deployer, networkName) {
  return deployTargetAndDelegate(artifacts, deployer, CaseSecondPhaseManager, networkName)
};
