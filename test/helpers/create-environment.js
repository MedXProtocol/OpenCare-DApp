const toRegistryKey = require('../../migrations/support/to-registry-key')

module.exports = async function createEnvironment(artifacts) {
  const Case = artifacts.require("./Case.sol")
  const MedXToken = artifacts.require("./MedXToken.sol")
  const DoctorManager = artifacts.require('./DoctorManager.sol')
  const Delegate = artifacts.require('./Delegate.sol')
  const CaseFactory = artifacts.require('./CaseFactory.sol')
  const Registry = artifacts.require("./Registry.sol")

  let registry = await Registry.new()
  let medXToken = await MedXToken.new()

  let caseInstance = await Case.new()
  await registry.register(toRegistryKey('Case'), caseInstance.address)

  let caseFactoryInstance = await CaseFactory.new()
  await registry.register(toRegistryKey('CaseFactoryTarget'), caseFactoryInstance.address)
  let caseFactoryDelegate = await Delegate.new(registry.address, toRegistryKey('CaseFactoryTarget'))
  await registry.register(toRegistryKey('CaseFactory'), caseFactoryDelegate.address)
  let caseFactory = await CaseFactory.at(caseFactoryDelegate.address)
  await caseFactory.initialize(10, medXToken.address, registry.address)

  let doctorManagerInstance = await DoctorManager.new()
  await registry.register(toRegistryKey('DoctorManagerTarget'), doctorManagerInstance.address)
  let doctorManagerDelegate = await Delegate.new(registry.address, toRegistryKey('DoctorManagerTarget'))
  await registry.register(toRegistryKey('DoctorManager'), doctorManagerDelegate.address)
  let doctorManager = await DoctorManager.at(doctorManagerDelegate.address)
  await doctorManager.initialize()

  return {
    registry,
    medXToken,
    caseFactory,
    doctorManager
  }
}
