const toRegistryKey = require('../../migrations/support/toRegistryKey')

const envDeployWithDelegate = require('./env-deploy-with-delegate')

module.exports = async function createEnvironment(artifacts) {
  const Case = artifacts.require("./Case.sol")
  const MedXToken = artifacts.require("./MedXToken.sol")
  const WETH9 = artifacts.require("./WETH9.sol")
  const DoctorManager = artifacts.require('./DoctorManager.sol')
  const AccountManager = artifacts.require('./AccountManager.sol')
  const Delegate = artifacts.require('./Delegate.sol')
  const CaseManager = artifacts.require('./CaseManager.sol')
  const CaseDiagnosingDoctor = artifacts.require('./CaseDiagnosingDoctor.sol')
  const CaseLifecycleManager = artifacts.require('./CaseLifecycleManager.sol')
  const CaseFirstPhaseManager = artifacts.require('./CaseFirstPhaseManager.sol')
  const CaseSecondPhaseManager = artifacts.require('./CaseSecondPhaseManager.sol')
  const CaseScheduleManager = artifacts.require('./CaseScheduleManager.sol')
  const CaseStatusManager = artifacts.require('./CaseStatusManager.sol')
  const BetaFaucet = artifacts.require('./BetaFaucet.sol')
  const Registry = artifacts.require("./Registry.sol")
  const EtherPriceFeed = artifacts.require('./EtherPriceFeed.sol')

  let registry = await Registry.new()
  let medXToken = await MedXToken.new()

  let weth9 = await WETH9.new()
  await registry.register(toRegistryKey('WrappedEther'), weth9.address)

  let etherPriceFeed = await EtherPriceFeed.new()
  await registry.register(toRegistryKey('EtherPriceFeed'), etherPriceFeed.address)
  await etherPriceFeed.set(web3.toWei('300', 'ether'))

  let caseInstance = await Case.new()
  await registry.register(toRegistryKey('Case'), caseInstance.address)

  let caseManager = await envDeployWithDelegate(registry, Delegate, CaseManager, 'CaseManager')
  await caseManager.setBaseCaseFee(web3.toWei('10', 'ether'))

  let caseDiagnosingDoctor = await envDeployWithDelegate(registry, Delegate, CaseDiagnosingDoctor, 'CaseDiagnosingDoctor')

  let caseStatusManager = await envDeployWithDelegate(registry, Delegate, CaseStatusManager, 'CaseStatusManager')

  let caseScheduleManager = await envDeployWithDelegate(registry, Delegate, CaseScheduleManager, 'CaseScheduleManager')

  let caseLifecycleManager = await envDeployWithDelegate(registry, Delegate, CaseLifecycleManager, 'CaseLifecycleManager')

  let caseFirstPhaseManager = await envDeployWithDelegate(registry, Delegate, CaseFirstPhaseManager, 'CaseFirstPhaseManager')

  let caseSecondPhaseManager = await envDeployWithDelegate(registry, Delegate, CaseSecondPhaseManager, 'CaseSecondPhaseManager')

  let doctorManager = await envDeployWithDelegate(registry, Delegate, DoctorManager, 'DoctorManager')

  let betaFaucet = await envDeployWithDelegate(registry, Delegate, BetaFaucet, 'BetaFaucet')

  let accountManager = await envDeployWithDelegate(registry, Delegate, AccountManager, 'AccountManager')

  return {
    betaFaucet,
    registry,
    medXToken,
    weth9,
    etherPriceFeed,
    caseManager,
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
