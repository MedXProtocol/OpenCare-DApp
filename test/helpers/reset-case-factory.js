const toRegistryKey = require('../../migrations/support/to-registry-key')

module.exports = async function (artifacts, env) {
  const Delegate = artifacts.require('Delegate.sol')
  const CaseManager = artifacts.require('CaseManager.sol')

  let caseManagerDelegate = await Delegate.new(env.registry.address, toRegistryKey('CaseManagerTarget'))
  await env.registry.register(toRegistryKey('CaseManager'), caseManagerDelegate.address)
  let caseManager = await CaseManager.at(caseManagerDelegate.address)
  await caseManager.initialize(web3.toWei('10'), env.medXToken.address, env.registry.address)
  return caseManager
}
