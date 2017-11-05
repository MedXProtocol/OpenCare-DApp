let MedCredits = artifacts.require("./MedCredits.sol");

module.exports = function(deployer) {
    deployer.deploy(MedCredits);
};
