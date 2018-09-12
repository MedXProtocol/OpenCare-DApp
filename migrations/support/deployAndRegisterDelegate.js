var toRegistryKey = require('./toRegistryKey')

// Internally used by deployTargetAndDelegate, don't use this directly

/**
 * WARNING: Use this to destroy and replace a Delegate, which will blow away the memory
 * Typically you only want to replace the behaviour, which lives in the Target Contract
 * (ie. replace the DoctorManagerTarget, not the DoctorManager (delegate))
 *
 * expects the Delegate to have a constructor Delegate(address _registry, byte32 _key)
 */
module.exports = function (deployer, delegate, registry, key, target) {
  let delegateKey = toRegistryKey(key)
  let targetKey = toRegistryKey(target)
  return deployer.then(function () {
    return registry.deployed().then((registryInstance) => {
      return deployer.deploy(delegate, registryInstance.address, targetKey).then(() => {
        return registryInstance.register(delegateKey, delegate.address).then(() => {
          return delegate.address
        })
      })
    })
  })
}
