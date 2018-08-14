import betaFaucetContractConfig from '#/BetaFaucet.json'
import medXTokenContractConfig from '#/MedXToken.json'
import caseManagerContractConfig from '#/CaseManager.json'
import caseStatusManagerContractConfig from '#/CaseStatusManager.json'
import caseContractConfig from '#/Case.json'
import doctorManagerContractConfig from '#/DoctorManager.json'
import accountManagerConfig from '#/AccountManager.json'
import registryConfig from '#/Registry.json'

import { abiFactory } from '~/saga-genesis/utils'

export default {
  contractFactories: {
    AccountManager: abiFactory(accountManagerConfig.abi),
    CaseManager: abiFactory(caseManagerContractConfig.abi),
    CaseStatusManager: abiFactory(caseStatusManagerContractConfig.abi),
    BetaFaucet: abiFactory(betaFaucetContractConfig.abi),
    MedXToken: abiFactory(medXTokenContractConfig.abi),
    DoctorManager: abiFactory(doctorManagerContractConfig.abi),
    Case: abiFactory(caseContractConfig.abi),
    Registry: abiFactory(registryConfig.abi)
  }
}
