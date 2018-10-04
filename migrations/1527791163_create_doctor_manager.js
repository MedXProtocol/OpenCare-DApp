const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
const DoctorManager = artifacts.require("./DoctorManager.sol")

module.exports = function(deployer, networkName) {
  return deployTargetAndDelegate(artifacts, deployer, DoctorManager, networkName)
};
