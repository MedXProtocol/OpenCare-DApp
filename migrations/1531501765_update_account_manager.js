const deployAndRegister = require('./support/deploy-and-register')
const toRegistryKey = require('./support/to-registry-key')

let AccountManager = artifacts.require("./AccountManager.sol")
let Registry = artifacts.require('./Registry.sol')

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()
    const accountManagerDelegateAddress = await registryInstance.lookup(toRegistryKey('AccountManager'))

    return deployAndRegister(deployer, AccountManager, Registry, 'AccountManagerTarget').then(() => {
      return AccountManager.at(accountManagerDelegateAddress).then(delegateInstance => {
        return delegateInstance.setRegistry(registryInstance.address)
      })
    })
  })
};
