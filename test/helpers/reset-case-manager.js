


const toRegistryKey = require('../../migrations/support/toRegistryKey')

module.exports = async function (artifacts, env) {
  const Delegate = artifacts.require('Delegate.sol')
  const CaseManager = artifacts.require('CaseManager.sol')
  const CaseStatusManager = artifacts.require('CaseStatusManager.sol')
  const WETH9 = artifacts.require('WETH9.sol')

  let caseManagerDelegate = await Delegate.new(env.registry.address, toRegistryKey('CaseManagerTarget'))
  await env.registry.register(toRegistryKey('CaseManager'), caseManagerDelegate.address)
  let caseManager = await CaseManager.at(caseManagerDelegate.address)
  await caseManager.setBaseCaseFee(web3.toWei('10', 'ether'))

  let caseStatusManagerDelegate = await Delegate.new(env.registry.address, toRegistryKey('CaseStatusManagerTarget'))
  await env.registry.register(toRegistryKey('CaseStatusManager'), caseStatusManagerDelegate.address)
  let caseStatusManager = await CaseStatusManager.at(caseStatusManagerDelegate.address)

  let wrappedEther = await WETH9.new()
  await env.registry.register(toRegistryKey('WrappedEther'), wrappedEther.address)

  env.caseManager = caseManager
  env.caseStatusManager = caseStatusManager
  env.weth9 = wrappedEther
}
