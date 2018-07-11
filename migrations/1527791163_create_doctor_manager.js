const deployWithDelegate = require('./support/deployWithDelegate')
const DoctorManager = artifacts.require("./DoctorManager.sol");

module.exports = function(deployer) {
  deployWithDelegate(artifacts, deployer, DoctorManager).then((doctorManager) => {
    return doctorManager.initialize()
  })
};
