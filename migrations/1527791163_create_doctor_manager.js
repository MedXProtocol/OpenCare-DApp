const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
const DoctorManager = artifacts.require("./DoctorManager.sol")

module.exports = function(deployer) {
  return deployTargetAndDelegate(artifacts, deployer, DoctorManager)
};
