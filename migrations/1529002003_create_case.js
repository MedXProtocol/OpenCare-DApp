var deployAndRegister = require('./support/deployAndRegister')

const Case = artifacts.require("./Case.sol")
const Registry = artifacts.require('./Registry.sol')

module.exports = function(deployer) {
  deployAndRegister(deployer, Case, Registry, 'Case')
}
