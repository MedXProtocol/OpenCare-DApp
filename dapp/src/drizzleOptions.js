import medXTokenContractConfig from '#/MedXToken.json'
import caseManagerContractConfig from '#/CaseManager.json'
import caseContractConfig from '#/Case.json'
import doctorManagerContractConfig from '#/DoctorManager.json'
import accountManagerConfig from '#/AccountManager.json'
import registryConfig from '#/Registry.json'
import {
  getCaseManagerContract,
  getDoctorManagerContract,
  getAccountManagerContract,
  lookupContractAt
} from '@/utils/web3-util'

export default async function () {
  const caseManager = await getCaseManagerContract()
  const doctorManager = await getDoctorManagerContract()
  const accountManager = await getAccountManagerContract()
  return {
    contracts: [
      medXTokenContractConfig,
      {
        contractName: 'CaseManager',
        web3Contract: caseManager
      },
      {
        contractName: 'DoctorManager',
        web3Contract: doctorManager
      },
      {
        contractName: 'AccountManager',
        web3Contract: accountManager
      }
    ],
    events: {
      MedXToken: [
        'Mint'
      ]
    },
    polls: {
    }
  }
}
