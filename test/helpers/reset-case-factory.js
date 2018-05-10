const toRegistryKey = require('../../migrations/support/to-registry-key')

module.exports = async function (artifacts, env) {
  const Delegate = artifacts.require('Delegate.sol')
  const CaseFactory = artifacts.require('CaseFactory.sol')

  let caseFactoryDelegate = await Delegate.new(env.registry.address, toRegistryKey('CaseFactoryTarget'))
  await env.registry.register(toRegistryKey('CaseFactory'), caseFactoryDelegate.address)
  let caseFactory = await CaseFactory.at(caseFactoryDelegate.address)
  await caseFactory.initialize(10, env.medXToken.address, env.registry.address)
  return caseFactory
}
