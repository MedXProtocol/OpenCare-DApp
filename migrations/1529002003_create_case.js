var deployAndRegister = require('./support/deployAndRegister')

const Case = artifacts.require("./Case.sol")
const Registry = artifacts.require('./Registry.sol')
const RegistryLookup = artifacts.require('./RegistryLookup.sol')

module.exports = function(deployer) {
  deployer.then(async () => {
    deployer.link(RegistryLookup, Case)
    return deployAndRegister(deployer, Case, Registry, 'Case')
  })
}
