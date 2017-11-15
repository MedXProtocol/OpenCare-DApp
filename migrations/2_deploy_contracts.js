let MedXToken = artifacts.require("./MedXToken.sol");
let DoctorManager = artifacts.require("./DoctorManager.sol");
let CaseFactory = artifacts.require("./CaseFactory.sol");

module.exports = function(deployer) {
    deployer.deploy(MedXToken).then(function () {
        return deployer.deploy(DoctorManager);
    }).then(function() {
        return deployer.deploy(CaseFactory, 100, MedXToken.address, DoctorManager.address);
    });
};
