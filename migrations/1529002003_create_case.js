var deployAndRegister = require('./support/deploy-and-register')

const Case = artifacts.require("./Case.sol")
const Registry = artifacts.require('./Registry.sol')

module.exports = function(deployer) {
  deployer.then(async () => {
    return deployAndRegister(deployer, Case, Registry, 'Case')
  })
}
