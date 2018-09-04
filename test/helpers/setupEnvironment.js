const toRegistryKey = require('../../migrations/support/to-registry-key')

const envDeployWithDelegate = require('./env-deploy-with-delegate')

module.exports = async function setupEnvironment(artifacts) {
  const Case = artifacts.require("./Case.sol")
  const MedXToken = artifacts.require("./MedXToken.sol")
  const WETH9 = artifacts.require("./WETH9.sol")
  const DoctorManager = artifacts.require('./DoctorManager.sol')
  const AccountManager = artifacts.require('./AccountManager.sol')
  const Delegate = artifacts.require('./Delegate.sol')
  const CaseManager = artifacts.require('./CaseManager.sol')
  const CaseLifecycleManager = artifacts.require('./CaseLifecycleManager.sol')
  const CaseFirstPhaseManager = artifacts.require('./CaseFirstPhaseManager.sol')
  const CaseSecondPhaseManager = artifacts.require('./CaseSecondPhaseManager.sol')
  const CaseScheduleManager = artifacts.require('./CaseScheduleManager.sol')
  const CaseStatusManager = artifacts.require('./CaseStatusManager.sol')
  const BetaFaucet = artifacts.require('./BetaFaucet.sol')
  const Registry = artifacts.require("./Registry.sol")
  const EtherPriceFeed = artifacts.require('./EtherPriceFeed.sol')

  let registry = await Registry.deployed()
  let medXToken = await MedXToken.deployed()

  let weth9 = await WETH9.at(await registry.lookup(toRegistryKey('WrappedEther')))
  let etherPriceFeed = await EtherPriceFeed.at(await registry.lookup(toRegistryKey('EtherPriceFeed')))
  let caseManager = await CaseManager.at(await registry.lookup(toRegistryKey('CaseManager')))
  let caseStatusManager = await CaseStatusManager.at(await registry.lookup(toRegistryKey('CaseStatusManager')))
  let caseScheduleManager = await CaseScheduleManager.at(await registry.lookup(toRegistryKey('CaseScheduleManager')))
  let caseLifecycleManager = await CaseLifecycleManager.at(await registry.lookup(toRegistryKey('CaseLifecycleManager')))
  let caseFirstPhaseManager = await CaseFirstPhaseManager.at(await registry.lookup(toRegistryKey('CaseFirstPhaseManager')))
  let caseSecondPhaseManager = await CaseSecondPhaseManager.at(await registry.lookup(toRegistryKey('CaseSecondPhaseManager')))
  let doctorManager = await DoctorManager.at(await registry.lookup(toRegistryKey('DoctorManager')))
  let betaFaucet = await BetaFaucet.at(await registry.lookup(toRegistryKey('BetaFaucet')))
  let accountManager = await AccountManager.at(await registry.lookup(toRegistryKey('AccountManager')))

  return {
    betaFaucet,
    registry,
    medXToken,
    weth9,
    etherPriceFeed,
    caseManager,
    caseLifecycleManager,
    caseFirstPhaseManager,
    caseSecondPhaseManager,
    caseScheduleManager,
    caseStatusManager,
    doctorManager,
    accountManager
  }
}
