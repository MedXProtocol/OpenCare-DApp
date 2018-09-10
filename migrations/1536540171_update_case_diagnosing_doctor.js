const deployAndRegister = require('./support/deployAndRegister')
const toRegistryKey = require('./support/toRegistryKey')

let CaseDiagnosingDoctor = artifacts.require("./CaseDiagnosingDoctor.sol")
let Registry = artifacts.require('./Registry.sol')

module.exports = function(deployer) {
  return deployAndRegister(deployer, CaseDiagnosingDoctor, Registry, 'CaseDiagnosingDoctorTarget')
};
