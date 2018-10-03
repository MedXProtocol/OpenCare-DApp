const Migrations = artifacts.require("./Migrations.sol");
const appendInstance = require('truffle-deploy-registry').appendInstance

module.exports = function(deployer) {
  deployer.deploy(Migrations).then(appendInstance)
};
