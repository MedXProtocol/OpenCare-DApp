import medXTokenContractConfig from '#/MedXToken.json'
import caseManagerContractConfig from '#/CaseManager.json'
import caseContractConfig from '#/Case.json'
import doctorManagerContractConfig from '#/DoctorManager.json'
import accountManagerConfig from '#/AccountManager.json'
import registryConfig from '#/Registry.json'

function abiFactory(abi) {
  return function (web3, address) {
    return new web3.eth.Contract(abi, address)
  }
}

export default {
  contractFactories: {
    AccountManager: abiFactory(accountManagerConfig.abi),
    CaseManager: abiFactory(caseManagerContractConfig.abi),
    MedXToken: abiFactory(medXTokenContractConfig.abi),
    DoctorManager: abiFactory(doctorManagerContractConfig.abi),
    Case: abiFactory(caseContractConfig.abi),
    Registry: abiFactory(registryConfig.abi)
  }
}
