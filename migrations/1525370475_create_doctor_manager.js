let DoctorManager = artifacts.require("./DoctorManager.sol");

module.exports = function(deployer) {
  deployer.deploy(DoctorManager);
};
