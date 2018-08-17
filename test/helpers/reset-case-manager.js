const toRegistryKey = require('../../migrations/support/to-registry-key')

module.exports = async function (artifacts, env) {
  const Delegate = artifacts.require('Delegate.sol')
  const CaseManager = artifacts.require('CaseManager.sol')
  const CaseStatusManager = artifacts.require('CaseStatusManager.sol')

  console.log('wat up denver')

  let caseManagerDelegate = await Delegate.new(env.registry.address, toRegistryKey('CaseManagerTarget'))
  await env.registry.register(toRegistryKey('CaseManager'), caseManagerDelegate.address)
  let caseManager = await CaseManager.at(caseManagerDelegate.address)
  await caseManager.initialize(web3.toWei('10', 'ether'), env.medXToken.address, env.registry.address)

  console.log('denver')

  let caseStatusManagerDelegate = await Delegate.new(env.registry.address, toRegistryKey('CaseStatusManagerTarget'))
  await env.registry.register(toRegistryKey('CaseStatusManager'), caseStatusManagerDelegate.address)
  let caseStatusManager = await CaseStatusManager.at(caseStatusManagerDelegate.address)
  await caseStatusManager.initialize(env.registry.address)

  console.log('fuck soliidi')


  env.caseManager = caseManager
  env.caseStatusManager = caseStatusManager
}
