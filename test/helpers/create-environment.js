const toRegistryKey = require('../../migrations/support/toRegistryKey')

const envDeployWithDelegate = require('./env-deploy-with-delegate')

module.exports = async function createEnvironment(artifacts) {
  const Case = artifacts.require("./Case.sol")
  const MedXToken = artifacts.require("./MedXToken.sol")
  const WETH9 = artifacts.require("./WETH9.sol")
  const DoctorManager = artifacts.require('./DoctorManager.sol')
  const AccountManager = artifacts.require('./AccountManager.sol')
  const Delegate = artifacts.require('./Delegate.sol')
  const AdminSettings = artifacts.require('./AdminSettings.sol')
  const CaseManager = artifacts.require('./CaseManager.sol')
  const CaseDiagnosingDoctor = artifacts.require('./CaseDiagnosingDoctor.sol')
  const CaseLifecycleManager = artifacts.require('./CaseLifecycleManager.sol')
  const CaseFirstPhaseManager = artifacts.require('./CaseFirstPhaseManager.sol')
  const CaseSecondPhaseManager = artifacts.require('./CaseSecondPhaseManager.sol')
  const CaseScheduleManager = artifacts.require('./CaseScheduleManager.sol')
  const CaseStatusManager = artifacts.require('./CaseStatusManager.sol')
  const CasePaymentManager = artifacts.require('./CasePaymentManager.sol')
  const Dai = artifacts.require('./Dai.sol')
  const BetaFaucet = artifacts.require('./BetaFaucet.sol')
  const Registry = artifacts.require("./Registry.sol")
  const EtherPriceFeed = artifacts.require('./EtherPriceFeed.sol')

  const registry = await Registry.new()
  const medXToken = await MedXToken.new()

  const weth9 = await WETH9.new()
  await registry.register(toRegistryKey('WrappedEther'), weth9.address)

  const dai = await Dai.new()
  await registry.register(toRegistryKey('Dai'), dai.address)

  const etherPriceFeed = await EtherPriceFeed.new()
  await registry.register(toRegistryKey('EtherPriceFeed'), etherPriceFeed.address)
  await etherPriceFeed.set(web3.toWei('300', 'ether'))

  const caseInstance = await Case.new()
  await registry.register(toRegistryKey('Case'), caseInstance.address)

  const adminSettings = await envDeployWithDelegate(registry, Delegate, AdminSettings, 'AdminSettings')

  const caseManager = await envDeployWithDelegate(registry, Delegate, CaseManager, 'CaseManager')

  const caseDiagnosingDoctor = await envDeployWithDelegate(registry, Delegate, CaseDiagnosingDoctor, 'CaseDiagnosingDoctor')

  const caseStatusManager = await envDeployWithDelegate(registry, Delegate, CaseStatusManager, 'CaseStatusManager')

  const caseScheduleManager = await envDeployWithDelegate(registry, Delegate, CaseScheduleManager, 'CaseScheduleManager')

  const caseLifecycleManager = await envDeployWithDelegate(registry, Delegate, CaseLifecycleManager, 'CaseLifecycleManager')

  const caseFirstPhaseManager = await envDeployWithDelegate(registry, Delegate, CaseFirstPhaseManager, 'CaseFirstPhaseManager')

  const caseSecondPhaseManager = await envDeployWithDelegate(registry, Delegate, CaseSecondPhaseManager, 'CaseSecondPhaseManager')

  const casePaymentManager = await envDeployWithDelegate(registry, Delegate, CasePaymentManager, 'CasePaymentManager')
  await casePaymentManager.setBaseCaseFeeUsdWei(web3.toWei('10', 'ether'))

  const doctorManager = await envDeployWithDelegate(registry, Delegate, DoctorManager, 'DoctorManager')

  const betaFaucet = await envDeployWithDelegate(registry, Delegate, BetaFaucet, 'BetaFaucet')

  const accountManager = await envDeployWithDelegate(registry, Delegate, AccountManager, 'AccountManager')

  return {
    betaFaucet,
    registry,
    medXToken,
    weth9,
    dai,
    etherPriceFeed,
    adminSettings,
    caseManager,
    casePaymentManager,
    caseDiagnosingDoctor,
    caseLifecycleManager,
    caseFirstPhaseManager,
    caseSecondPhaseManager,
    caseScheduleManager,
    caseStatusManager,
    doctorManager,
    accountManager
  }
}
