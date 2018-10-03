const MedXToken = artifacts.require("./MedXToken.sol");
const appendInstance = require('truffle-deploy-registry').appendInstance

module.exports = function(deployer) {
  deployer.deploy(MedXToken).then(appendInstance)
};
