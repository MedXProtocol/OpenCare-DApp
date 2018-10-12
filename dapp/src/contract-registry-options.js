import betaFaucetContractConfig from '#/BetaFaucet.json'
import medXTokenContractConfig from '#/MedXToken.json'
import weth9ContractConfig from '#/WETH9.json'
import adminSettingsContractConfig from '#/AdminSettings.json'
import caseManagerContractConfig from '#/CaseManager.json'
import caseDiagnosingDoctorContractConfig from '#/CaseDiagnosingDoctor.json'
import caseLifecycleManagerContractConfig from '#/CaseLifecycleManager.json'
import caseFirstPhaseManagerContractConfig from '#/CaseFirstPhaseManager.json'
import caseSecondPhaseManagerContractConfig from '#/CaseSecondPhaseManager.json'
import caseScheduleManagerContractConfig from '#/CaseScheduleManager.json'
import caseStatusManagerContractConfig from '#/CaseStatusManager.json'
import caseContractConfig from '#/Case.json'
import casePaymentManagerConfig from '#/CasePaymentManager.json'
import doctorManagerContractConfig from '#/DoctorManager.json'
import accountManagerConfig from '#/AccountManager.json'
import fromBlockNumberConfig from '#/FromBlockNumber.json'
import daiConfig from '#/Dai.json'
import registryConfig from '#/Registry.json'

import { abiFactory } from 'saga-genesis'

export default {
  contractFactories: {
    AccountManager: abiFactory(accountManagerConfig.abi),
    AdminSettings: abiFactory(adminSettingsContractConfig.abi),
    CaseManager: abiFactory(caseManagerContractConfig.abi),
    CaseDiagnosingDoctor: abiFactory(caseDiagnosingDoctorContractConfig.abi),
    CaseLifecycleManager: abiFactory(caseLifecycleManagerContractConfig.abi),
    CaseFirstPhaseManager: abiFactory(caseFirstPhaseManagerContractConfig.abi),
    CasePaymentManager: abiFactory(casePaymentManagerConfig.abi),
    CaseSecondPhaseManager: abiFactory(caseSecondPhaseManagerContractConfig.abi),
    CaseScheduleManager: abiFactory(caseScheduleManagerContractConfig.abi),
    CaseStatusManager: abiFactory(caseStatusManagerContractConfig.abi),
    BetaFaucet: abiFactory(betaFaucetContractConfig.abi),
    FromBlockNumber: abiFactory(fromBlockNumberConfig.abi),
    MedXToken: abiFactory(medXTokenContractConfig.abi),
    DoctorManager: abiFactory(doctorManagerContractConfig.abi),
    Case: abiFactory(caseContractConfig.abi),
    Registry: abiFactory(registryConfig.abi),
    WrappedEther: abiFactory(weth9ContractConfig.abi),
    Dai: abiFactory(daiConfig.abi)
  }
}
