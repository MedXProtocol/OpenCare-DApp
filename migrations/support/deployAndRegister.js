var toRegistryKey = require('./toRegistryKey')

/** @title deployAndRegister
  * @dev Deploys a new Contract and registers it with the Registry
  */
module.exports = function (deployer, Contract, Registry, key, constructorArgsArray) {
  constructorArgsArray = constructorArgsArray || []
  constructorArgsArray.unshift(Contract)
  return deployer.deploy(Contract).then(async function (instance) {
    await Registry.deployed().then(async function (registryInstance) {
      await registryInstance.register(toRegistryKey(key), Contract.address)
      return instance
    }).catch(function (error) {
      console.error(error)
      throw error
    })
    return instance
  }).catch(function (error) {
    console.error(error)
    throw error
  })
}
