import medXTokenContractConfig from '#/MedXToken.json'
import caseManagerContractConfig from '#/CaseManager.json'
import caseContractConfig from '#/Case.json'
import doctorManagerContractConfig from '#/DoctorManager.json'
import accountManagerConfig from '#/AccountManager.json'
import registryConfig from '#/Registry.json'
import { promisify } from './common-util'
import { signedInSecretKey } from '@/services/sign-in'
import hashToHex from '@/utils/hash-to-hex'
import aes from '@/services/aes'
import getWeb3 from '@/get-web3'
import { caseStatusToName } from './case-status-to-name'
import bytesToHex from './bytes-to-hex'
import { Status } from './status'
import { getFileHashFromBytes } from '@/utils/get-file-hash-from-bytes'

export async function getSelectedAccount() {
  const web3 = getWeb3()
  let accounts = await web3.eth.getAccounts()
  if (!accounts) { throw 'No accounts available' }
  return accounts[0]
}

export async function isDoctor() {
  const contract = await getDoctorManagerContract()
  const selectedAccount = await getSelectedAccount()
  return contract.methods.isDoctor(selectedAccount).call()
}

export async function getSelectedAccountBalance() {
  const selectedAccount = await getSelectedAccount()
  const contract = await getMedXTokenContract()
  const balance = await contract.methods.balanceOf(selectedAccount).call()
  return balance.toString()
}

export async function mintMedXTokens(account, amount, callback) {
  const contract = await getMedXTokenContract()
  return contract.methods.mint(account, amount).send()
    .then((result) => {
      waitForTxComplete(result, callback)
    })
    .catch((error) => {
      callback(error)
    })
}

export async function getCaseDate(address) {
  // const contract = await getCaseContract(address)
  // let watcher = contract.CaseCreated({}, {fromBlock: 0, toBlock: 'latest'})
  // let event = await promisify(cb => {
  //   watcher.watch((error, result) => {
  //     watcher.stopWatching()
  //     cb(error, result)
  //   })
  // })
  // const web3 = getWeb3()
  // let block = await promisify(cb => web3.eth.getBlock(event.blockNumber, cb))
  // return block.timestamp
  return 0
}

export function setPublicKey(publicKey) {
  return getAccountManagerContract().then((accountManager) => {
    return accountManager.methods.setPublicKey('0x' + publicKey).send()
  })
}

export async function getPublicKey(address) {
  if (!address) { address = await getSelectedAccount() }
  return getAccountManagerContract().then((accountManager) => {
    return accountManager.methods.publicKeys(address).call()
  })
}

export async function createCase(encryptedCaseKey, documentHash, callback) {
  const contract = await getMedXTokenContract()
  const caseManager = await getCaseManagerContract()
  const caseManagerAddress = caseManager.options.address
  var hashHex = hashToHex(documentHash)
  const combined = '0x' + encryptedCaseKey + hashHex

  return contract.methods.approveAndCall(caseManagerAddress, 15, combined).send()
}

export async function getCaseStatus(caseAddress) {
  const contract = await getCaseContract(caseAddress)
  let status = await contract.methods.status().call()
  status = status.toString()
  const code = parseInt(status)
  return {
      code,
      name: caseStatusToName(status),
      object: new Status(code)
  }
}

export async function getCaseKey(caseAddress) {
  const contract = await getCaseContract(caseAddress)
  let encryptedCaseKeyBytes = await contract.methods.getEncryptedCaseKey().call()
  let encryptedCaseKey = bytesToHex(encryptedCaseKeyBytes)
  return encryptedCaseKey
}

export async function getCaseDetailsLocationHash(caseAddress) {
  const contract = await getCaseContract(caseAddress)
  return getFileHashFromBytes(await contract.methods.caseDetailLocationHash().call())
}

export async function getCaseDoctorADiagnosisLocationHash(caseAddress) {
  const contract = await getCaseContract(caseAddress)
  return getFileHashFromBytes(await contract.methods.diagnosisALocationHash().call())
}

export async function getCaseDoctorBDiagnosisLocationHash(caseAddress) {
  const contract = await getCaseContract(caseAddress)
  return getFileHashFromBytes(await contract.methods.diagnosisBLocationHash().call())
}

export async function getAllCasesForCurrentAccount() {
  const contract = await getCaseManagerContract()
  const account = await getSelectedAccount()

  const count = await contract.methods.getPatientCaseListCount(account).call()

  let cases = []

  for(let i = 0; i < count; i++) {
    const caseContractAddress = await contract.methods.patientCases(account, i).call()
    const caseContract = await getCaseContract(caseContractAddress)
    const status = await caseContract.methods.status().call()

    cases.push({
      number: i + 1,
      address: caseContractAddress,
      status: status.toString(),
      statusName: caseStatusToName(status.toString())
    })
  }

  return cases
}

export async function openCaseCount() {
  return getCaseManagerContract().then((contract) => {
    return contract.methods.openCaseCount().call()
  })
}

export async function getNextCaseFromQueue() {
  const contract = await getCaseManagerContract()
  await contract.methods.requestNextCase().send()
}

export async function registerDoctor(address, callback) {
  const contract = await getDoctorManagerContract()
  return contract.methods.addDoctor(address).send(function(error, result) {
    if(error !== null){
        callback(error, result)
    } else {
        waitForTxComplete(result, callback)
    }
  })
}

export async function acceptDiagnosis(caseAddress, callback) {
  const contract = await getCaseContract(caseAddress)
  contract.methods.acceptDiagnosis().send(function(error, result) {
    if(error !== null){
        callback(error, result)
    } else {
        waitForTxComplete(result, callback)
    }
  })
}

export async function challengeDiagnosis(caseAddress, callback) {
  const contract = await getCaseContract(caseAddress)
  contract.methods.challengeDiagnosis().send(function(error, result) {
    if(error !== null){
      callback(error, result)
    } else {
      waitForTxComplete(result, callback)
    }
  })
}

export async function diagnoseCase(caseAddress, diagnosisHash, callback) {
  const contract = await getCaseContract(caseAddress)
  contract.methods.diagnoseCase(diagnosisHash).send(function(error, result) {
    if(error !== null){
      callback(error, result)
    } else {
      waitForTxComplete(result, callback)
    }
  })
}

export async function diagnoseChallengedCase(caseAddress, diagnosisHash, accept, callback) {
  const contract = await getCaseContract(caseAddress)
  contract.methods.diagnoseChallengedCase(diagnosisHash, accept).send(function(error, result) {
    if(error !== null){
      callback(error, result)
    } else {
      waitForTxComplete(result, callback)
    }
  })
}

export async function contractFromConfig (config, address) {
  const web3 = getWeb3()
  if (!address) {
    let networkId = await web3.eth.net.getId()
    if (!networkId) throw 'No network'
    address = config.networks[networkId].address
  }
  let account = await getSelectedAccount()
  return new web3.eth.Contract(config.abi, address, { from: account })
}

export async function getDoctorAuthorizationRequestCount() {
  let doctor = await getSelectedAccount()
  let caseManager = await getCaseManagerContract()
  return caseManager.methods.doctorAuthorizationRequestCount(doctor).call()
}

export async function getDoctorAuthorizationRequestCaseAtIndex(index) {
  let doctor = await getSelectedAccount()
  let caseManager = await getCaseManagerContract()
  return caseManager.methods.doctorAuthorizationRequestCaseAtIndex(doctor, index).call()
}

function getMedXTokenContract() {
  return contractFromConfig(medXTokenContractConfig)
}

export function getCaseManagerContract() {
  return lookupContractAt('CaseManager', caseManagerContractConfig)
}

export function getCaseContract(address) {
  return contractFromConfig(caseContractConfig, address)
}

export function getDoctorManagerContract() {
  return lookupContractAt('DoctorManager', doctorManagerContractConfig)
}

export function getAccountManagerContract () {
  return lookupContractAt('AccountManager', accountManagerConfig)
}

export function lookupContractAt(name, contractConfig) {
  return lookupContractAddress(name)
    .then((address) => {
      return contractFromConfig(contractConfig, address)
    })
    .catch((error) => console.error(error))
}

function lookupContractAddress(name) {
  return getRegistryContract().then((registry) => {
    return registry.methods.lookup(toRegistryKey(name)).call()
  }).catch((error) => console.error(error))
}

function getRegistryContract() {
  return contractFromConfig(registryConfig)
}

function toRegistryKey(string) {
  return getWeb3().utils.sha3(string)
}

function waitForTxComplete(txHash, callback) {
  const web3 = getWeb3()

  // console.log("TX Hash [" + txHash + "]")

  web3.eth.getTransactionReceipt(txHash, function (error, result) {
    if(error !== null) {
        callback(error, result)
        return
    }

    callback(null, result)
  })
}
