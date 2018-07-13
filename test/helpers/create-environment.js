const toRegistryKey = require('../../migrations/support/to-registry-key')

module.exports = async function createEnvironment(artifacts) {
  const Case = artifacts.require("./Case.sol")
  const MedXToken = artifacts.require("./MedXToken.sol")
  const DoctorManager = artifacts.require('./DoctorManager.sol')
  const AccountManager = artifacts.require('./AccountManager.sol')
  const Delegate = artifacts.require('./Delegate.sol')
  const CaseManager = artifacts.require('./CaseManager.sol')
  const BetaFaucet = artifacts.require('./BetaFaucet.sol')
  const Registry = artifacts.require("./Registry.sol")

  let registry = await Registry.new()
  let medXToken = await MedXToken.new()

  let caseInstance = await Case.new()
  await registry.register(toRegistryKey('Case'), caseInstance.address)

  let caseManagerInstance = await CaseManager.new()
  await registry.register(toRegistryKey('CaseManagerTarget'), caseManagerInstance.address)
  let caseManagerDelegate = await Delegate.new(registry.address, toRegistryKey('CaseManagerTarget'))
  await registry.register(toRegistryKey('CaseManager'), caseManagerDelegate.address)
  let caseManager = await CaseManager.at(caseManagerDelegate.address)
  await caseManager.initialize(10, medXToken.address, registry.address)

  let doctorManagerInstance = await DoctorManager.new()
  await registry.register(toRegistryKey('DoctorManagerTarget'), doctorManagerInstance.address)
  let doctorManagerDelegate = await Delegate.new(registry.address, toRegistryKey('DoctorManagerTarget'))
  await registry.register(toRegistryKey('DoctorManager'), doctorManagerDelegate.address)
  let doctorManager = await DoctorManager.at(doctorManagerDelegate.address)
  await doctorManager.initialize()

  let betaFaucetInstance = await BetaFaucet.new()
  await registry.register(toRegistryKey('BetaFaucetTarget'), betaFaucetInstance.address)
  let betaFaucetDelegate = await Delegate.new(registry.address, toRegistryKey('BetaFaucetTarget'))
  await registry.register(toRegistryKey('BetaFaucet'), betaFaucetDelegate.address)
  let betaFaucet = await BetaFaucet.at(betaFaucetDelegate.address)
  await betaFaucet.initialize()

  let accountManagerInstance = await AccountManager.new()
  await registry.register(toRegistryKey('AccountManagerTarget'), accountManagerInstance.address)
  let accountManagerDelegate = await Delegate.new(registry.address, toRegistryKey('AccountManagerTarget'))
  await registry.register(toRegistryKey('AccountManager'), accountManagerDelegate.address)
  let accountManager = await AccountManager.at(accountManagerDelegate.address)
  accountManager.setRegistry(registry.address)

  return {
    betaFaucet,
    registry,
    medXToken,
    caseManager,
    doctorManager,
    accountManager
  }
}
