let MedXToken = artifacts.require("./MedXToken.sol");

module.exports = function(deployer) {
  deployer.deploy(MedXToken);
};
