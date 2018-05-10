var deploy = require('./support/deploy')

let DoctorManager = artifacts.require("./DoctorManager.sol");

module.exports = function(deployer) {
  deploy(artifacts, deployer, DoctorManager).then((doctorManager) => {
    return doctorManager.initialize()
  })
};
