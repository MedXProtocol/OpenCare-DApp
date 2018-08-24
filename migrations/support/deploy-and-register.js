var toRegistryKey = require('./to-registry-key')

/** @title deployAndRegister
  * @dev Deploys a new contract and registers it with the Registry
  */
module.exports = function (deployer, contract, registry, key, constructorArgsArray) {
  constructorArgsArray = constructorArgsArray || []
  constructorArgsArray.unshift(contract)
  return deployer.deploy(contract).then(async function (instance) {
    await registry.deployed().then(async function (registryInstance) {
      await registryInstance.register(toRegistryKey(key), contract.address)
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
