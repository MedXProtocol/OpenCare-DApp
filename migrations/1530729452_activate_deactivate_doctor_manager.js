var deployAndRegister = require('./support/deploy-and-register')

let DoctorManager = artifacts.require("./DoctorManager.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployAndRegister(deployer, DoctorManager, Registry, 'DoctorManagerTarget')
};
