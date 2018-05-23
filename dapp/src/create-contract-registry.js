import {
  getAccountManagerContract,
  getCaseManagerContract,
  getMedXTokenContract,
  getDoctorManagerContract
} from '@/utils/web3-util'
import { ContractRegistry } from '@/saga-genesis'

async function createContactRegistry() {
  let contractRegistry = new ContractRegistry()
  var [ accountManager, caseManager, medXToken, doctorManager] =
    await Promise.all([
      getAccountManagerContract(),
      getCaseManagerContract(),
      getMedXTokenContract(),
      getDoctorManagerContract()
    ])
  contractRegistry.add(accountManager, 'AccountManager')
  contractRegistry.add(caseManager, 'CaseManager')
  contractRegistry.add(medXToken, 'MedXToken')
  contractRegistry.add(doctorManager, 'DoctorManager')
  return contractRegistry
}

export default createContactRegistry
