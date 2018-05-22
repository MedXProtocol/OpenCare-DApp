var toRegistryKey = require('./to-registry-key')

module.exports = function (deployer, contract, registry, key, constructorArgsArray) {
  constructorArgsArray = constructorArgsArray || []
  constructorArgsArray.unshift(contract)
  return deployer.deploy(contract).then(async function (instance) {
    await registry.deployed().then(function (registryInstance) {
      return registryInstance.register(toRegistryKey(key), contract.address)
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
