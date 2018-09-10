const toRegistryKey = require('../../migrations/support/toRegistryKey')

module.exports = async function (artifacts, env) {
  const Delegate = artifacts.require('Delegate.sol')
  const CaseManager = artifacts.require('CaseManager.sol')
  const CaseStatusManager = artifacts.require('CaseStatusManager.sol')
  const CasePaymentManager = artifacts.require('CasePaymentManager.sol')
  const WETH9 = artifacts.require('WETH9.sol')
  const Dai = artifacts.require('Dai.sol')

  let caseManagerDelegate = await Delegate.new(env.registry.address, toRegistryKey('CaseManagerTarget'))
  await env.registry.register(toRegistryKey('CaseManager'), caseManagerDelegate.address)
  let caseManager = await CaseManager.at(caseManagerDelegate.address)

  let casePaymentManagerDelegate = await Delegate.new(env.registry.address, toRegistryKey('CasePaymentManagerTarget'))
  await env.registry.register(toRegistryKey('CasePaymentManager'), casePaymentManagerDelegate.address)
  let casePaymentManager = await CasePaymentManager.at(casePaymentManagerDelegate.address)
  await casePaymentManager.setBaseCaseFeeUsdWei(web3.toWei('10', 'ether'))

  let caseStatusManagerDelegate = await Delegate.new(env.registry.address, toRegistryKey('CaseStatusManagerTarget'))
  await env.registry.register(toRegistryKey('CaseStatusManager'), caseStatusManagerDelegate.address)
  let caseStatusManager = await CaseStatusManager.at(caseStatusManagerDelegate.address)

  let wrappedEther = await WETH9.new()
  await env.registry.register(toRegistryKey('WrappedEther'), wrappedEther.address)

  let dai = await Dai.new()
  await env.registry.register(toRegistryKey('Dai'), dai.address)

  env.caseManager = caseManager
  env.caseStatusManager = caseStatusManager
  env.weth9 = wrappedEther
  env.dai = dai
}
