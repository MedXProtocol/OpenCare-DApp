const deployAndRegister = require('./support/deployAndRegister')
const toRegistryKey = require('./support/toRegistryKey')

let DoctorManager = artifacts.require("./DoctorManager.sol")
let Registry = artifacts.require('./Registry.sol')

module.exports = function(deployer) {
  return deployAndRegister(deployer, DoctorManager, Registry, 'DoctorManagerTarget')
};
