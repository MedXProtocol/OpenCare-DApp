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

function truffleArtifactContractFactory(config) {
  return abiFactory(config.abi)
}

export default {
  contractFactories: {
    AccountManager: truffleArtifactContractFactory(accountManagerConfig),
    CaseManager: truffleArtifactContractFactory(caseManagerContractConfig),
    MedXToken: truffleArtifactContractFactory(medXTokenContractConfig),
    DoctorManager: truffleArtifactContractFactory(doctorManagerContractConfig),
    Case: truffleArtifactContractFactory(caseContractConfig),
    Registry: truffleArtifactContractFactory(registryConfig)
  }
}
