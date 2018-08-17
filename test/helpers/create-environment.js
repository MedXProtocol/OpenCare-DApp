const toRegistryKey = require('../../migrations/support/to-registry-key')

const envDeployWithDelegate = require('./env-deploy-with-delegate')

module.exports = async function createEnvironment(artifacts) {
  const Case = artifacts.require("./Case.sol")
  const MedXToken = artifacts.require("./MedXToken.sol")
  const DoctorManager = artifacts.require('./DoctorManager.sol')
  const AccountManager = artifacts.require('./AccountManager.sol')
  const Delegate = artifacts.require('./Delegate.sol')
  const CaseManager = artifacts.require('./CaseManager.sol')
  const CaseScheduleManager = artifacts.require('./CaseScheduleManager.sol')
  const CaseStatusManager = artifacts.require('./CaseStatusManager.sol')
  const BetaFaucet = artifacts.require('./BetaFaucet.sol')
  const Registry = artifacts.require("./Registry.sol")

  let registry = await Registry.new()
  let medXToken = await MedXToken.new()

  let caseInstance = await Case.new()
  await registry.register(toRegistryKey('Case'), caseInstance.address)

  let caseManager = await envDeployWithDelegate(registry, Delegate, CaseManager, 'CaseManager')
  await caseManager.initialize(web3.toWei('10', 'ether'), medXToken.address, registry.address)

  let caseStatusManager = await envDeployWithDelegate(registry, Delegate, CaseStatusManager, 'CaseStatusManager')
  await caseStatusManager.initialize(registry.address)

  let caseScheduleManager = await envDeployWithDelegate(registry, Delegate, CaseScheduleManager, 'CaseScheduleManager')
  await caseScheduleManager.initialize(registry.address)

  let doctorManager = await envDeployWithDelegate(registry, Delegate, DoctorManager, 'DoctorManager')
  await doctorManager.initialize()

  let betaFaucet = await envDeployWithDelegate(registry, Delegate, BetaFaucet, 'BetaFaucet')
  await betaFaucet.initialize()

  let accountManager = await envDeployWithDelegate(registry, Delegate, AccountManager, 'AccountManager')
  await accountManager.setRegistry(registry.address)

  return {
    betaFaucet,
    registry,
    medXToken,
    caseManager,
    caseScheduleManager,
    caseStatusManager,
    doctorManager,
    accountManager
  }
}
