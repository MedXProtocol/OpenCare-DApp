var toRegistryKey = require('./to-registry-key')

/**
 * expects the Delegate to have a constructor Delegate(address _registry, byte32 _key)
 */
module.exports = function (deployer, delegate, registry, key, target) {
  let delegateKey = toRegistryKey(key)
  let targetKey = toRegistryKey(target)
  return deployer.then(function () {
    return registry.deployed().then((registryInstance) => {
      return deployer.deploy(delegate, registryInstance.address, targetKey).then(() => {
        return registryInstance.register(delegateKey, delegate.address)
      })
    })
  })
}