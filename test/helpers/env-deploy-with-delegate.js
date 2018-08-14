const toRegistryKey = require('../../migrations/support/to-registry-key')

module.exports = async function(registry, Delegate, contract, name) {
  let contractInstance = await contract.new()
  await registry.register(toRegistryKey(name + 'Target'), contractInstance.address)
  let contractDelegate = await Delegate.new(registry.address, toRegistryKey(name + 'Target'))
  await registry.register(toRegistryKey(name), contractDelegate.address)
  return await contract.at(contractDelegate.address)
}
