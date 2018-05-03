let MedXToken = artifacts.require("./MedXToken.sol");
let DoctorManager = artifacts.require("./DoctorManager.sol");
let CaseFactory = artifacts.require("./CaseFactory.sol");

module.exports = function(deployer) {
  deployer.then(async () => {
    let medXToken = MedXToken.deployed()
    let doctorManager = DoctorManager.deployed()
    deployer.deploy(CaseFactory, 10, MedXToken.address, DoctorManager.address);
  })
};
