import medXTokenContractConfig from '#/MedXToken.json'
import caseManagerContractConfig from '#/CaseManager.json'
import caseContractConfig from '#/Case.json'
import doctorManagerContractConfig from '#/DoctorManager.json'
import accountManagerConfig from '#/AccountManager.json'
import registryConfig from '#/Registry.json'
import { promisify } from './common-util'
import { signedInSecretKey } from '@/services/sign-in'
import aesjs from 'aes-js'
import aes from '@/services/aes'
import caseStatus from './case-status'
import getWeb3 from '@/get-web3'

export function getSelectedAccount() {
  const web3 = getWeb3()
  return web3.eth.accounts[0]
}

export async function isDoctor() {
  const contract = await getDoctorManagerContract()
  const selectedAccount = getSelectedAccount()
  return promisify(cb => contract.isDoctor(selectedAccount, cb))
}

export async function getSelectedAccountBalance() {
  const selectedAccount = getSelectedAccount()
  const contract = await getMedXTokenContract()
  const balance = await promisify(cb => contract.balanceOf(selectedAccount, cb))
  return balance.toNumber()
}

export async function mintMedXTokens(account, amount, callback) {
  const contract = await getMedXTokenContract()
  return promisify(cb => contract.mint(account, amount, getDefaultTxObj(), cb))
    .then((result) => {
      waitForTxComplete(result, callback)
    })
    .catch((error) => {
      callback(error)
    })
}

export async function getCaseDate(address) {
  const contract = await getCaseContract(address)
  let watcher = contract.CaseCreated({}, {fromBlock: 0, toBlock: 'latest'})
  let event = await promisify(cb => {
    watcher.watch((error, result) => {
      watcher.stopWatching()
      cb(error, result)
    })
  })
  const web3 = getWeb3()
  let block = await promisify(cb => web3.eth.getBlock(event.blockNumber, cb))
  return block.timestamp
}

export function setPublicKey(publicKey) {
  return getAccountManagerContract().then((accountManager) => {
    return promisify(cb => accountManager.setPublicKey(publicKey, cb))
  })
}

export function getPublicKey(address) {
  if (!address) { address = getSelectedAccount() }
  return getAccountManagerContract().then((accountManager) => {
    return promisify(cb => accountManager.publicKeys(address, cb))
  })
}

export async function createCase(encryptedCaseKey, documentHash, callback) {
  const contract = await getMedXTokenContract()
  const caseManager = await getCaseManagerContract()
  const caseManagerAddress = caseManager.address

  var hashBytes = aesjs.utils.utf8.toBytes(documentHash)
  var hashHex = aesjs.utils.hex.fromBytes(hashBytes)
  const combined = '0x' + encryptedCaseKey + hashHex

  contract.approveAndCall(
    caseManagerAddress, 15, combined, getDefaultTxObj(), function(error, result) {
        if(error !== null) {
            callback(error, result)
        } else {
            waitForTxComplete(result, callback)
        }
    }
  )
}

export async function getCaseStatus(caseAddress) {
  const contract = await getCaseContract(caseAddress)
  let status = await promisify(cb => contract.status.call(cb))
  status = status.toNumber()
  return {
      code: status,
      name: getCaseStatusName(status)
  }
}

export async function getCaseKey(caseAddress) {
  const contract = await getCaseContract(caseAddress)
  let encryptedCaseKeyBytes = await promisify(cb => contract.getEncryptedCaseKey(cb))
  let encryptedCaseKey = encryptedCaseKeyBytes.map((hex) => hex.substring(2)).join('')
  return encryptedCaseKey
}

export async function getCaseDetailsLocationHash(caseAddress) {
  const contract = await getCaseContract(caseAddress)
  return getFileHashFromBytes(await promisify(cb => contract.caseDetailLocationHash.call(cb)))
}

export async function getCaseDoctorADiagnosisLocationHash(caseAddress) {
  const contract = await getCaseContract(caseAddress)
  return getFileHashFromBytes(await promisify(cb => contract.diagnosisALocationHash.call(cb)))
}

export async function getCaseDoctorBDiagnosisLocationHash(caseAddress) {
  const contract = await getCaseContract(caseAddress)
  return getFileHashFromBytes(await promisify(cb => contract.diagnosisBLocationHash.call(cb)))
}

export async function getAllCasesForCurrentAccount() {
  const contract = await getCaseManagerContract()
  const account = getSelectedAccount()

  const count = await promisify(cb => contract.getPatientCaseListCount(account, cb))

  let cases = []

  for(let i = 0; i < count; i++) {
    const caseContractAddress = await promisify(cb => contract.patientCases.call(account, i, cb))
    const caseContract = await getCaseContract(caseContractAddress)
    const status = await promisify(cb => caseContract.status.call(cb))

    cases.push({
      number: i + 1,
      address: caseContractAddress,
      status: status.toNumber(),
      statusName: getCaseStatusName(status.toNumber())
    })
  }

  return cases
}

export async function openCaseCount() {
  return getCaseManagerContract().then((contract) => {
    return promisify(cb => contract.openCaseCount(cb))
  })
}

export async function getNextCaseFromQueue() {
  const contract = await getCaseManagerContract()
  await promisify(cb => contract.requestNextCase(cb))
}

export async function registerDoctor(address, callback) {
  const contract = await getDoctorManagerContract()
  return contract.addDoctor(address, getDefaultTxObj(), function(error, result) {
    if(error !== null){
        callback(error, result)
    } else {
        waitForTxComplete(result, callback)
    }
  })
}

export async function acceptDiagnosis(caseAddress, callback) {
  const contract = await getCaseContract(caseAddress)
  contract.acceptDiagnosis(getDefaultTxObj(), function(error, result) {
    if(error !== null){
        callback(error, result)
    } else {
        waitForTxComplete(result, callback)
    }
  })
}

export async function challengeDiagnosis(caseAddress, callback) {
  const contract = await getCaseContract(caseAddress)
  contract.challengeDiagnosis(getDefaultTxObj(), function(error, result) {
    if(error !== null){
      callback(error, result)
    } else {
      waitForTxComplete(result, callback)
    }
  })
}

export async function diagnoseCase(caseAddress, diagnosisHash, callback) {
  const contract = await getCaseContract(caseAddress)
  contract.diagnoseCase(diagnosisHash, getDefaultTxObj(), function(error, result) {
    if(error !== null){
      callback(error, result)
    } else {
      waitForTxComplete(result, callback)
    }
  })
}

export async function diagnoseChallengedCase(caseAddress, diagnosisHash, accept, callback) {
  const contract = await getCaseContract(caseAddress)
  contract.diagnoseChallengedCase(diagnosisHash, accept, getDefaultTxObj(), function(error, result) {
    if(error !== null){
      callback(error, result)
    } else {
      waitForTxComplete(result, callback)
    }
  })
}

function getCaseStatusName(status) {
  var statuses = {
    0: 'None',
    1: 'Open',
    2: 'Pending Approval',
    3: 'Evaluating',
    4: 'Evaluated',
    5: 'Closed',
    6: 'Challenged',
    7: 'Pending Approval',
    8: 'Challenging',
    9: 'Canceled',
    10: 'Diagnosis Rejected',
    11: 'Diagnosis Confirmed'
  }
  var string = statuses[status]
  if (!string) { throw new Error('Unknown status: ', status) }
  return string
}

export async function contractFromConfig (config, address) {
  const web3 = getWeb3()
  if (!address) {
    let networkId = await promisify(cb => web3.version.getNetwork(cb))
    address = config.networks[networkId].address
  }
  const Contract = web3.eth.contract(config.abi)
  return Contract.at(address)
}

export async function getDoctorAuthorizationRequestCount() {
  let doctor = getSelectedAccount()
  let caseManager = await getCaseManagerContract()
  return promisify(cb => caseManager.doctorAuthorizationRequestCount(doctor, cb))
}

export async function getDoctorAuthorizationRequestCaseAtIndex(index) {
  let doctor = getSelectedAccount()
  let caseManager = await getCaseManagerContract()
  return promisify(cb => caseManager.doctorAuthorizationRequestCaseAtIndex(doctor, index, cb))
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

function getDoctorManagerContract() {
  return lookupContractAt('DoctorManager', doctorManagerContractConfig)
}

function getAccountManagerContract () {
  return lookupContractAt('AccountManager', accountManagerConfig)
}

function lookupContractAt(name, contractConfig) {
  return lookupContractAddress(name).then((address) => {
    return contractFromConfig(contractConfig, address)
  })
}

function lookupContractAddress(name) {
  return getRegistryContract().then((registry) => {
    return promisify(cb => registry.lookup(toRegistryKey(name), cb))
  })
}

function getRegistryContract() {
  return contractFromConfig(registryConfig)
}

function getFileHashFromBytes(bytes) {
  if(bytes === "0x")
      return null
  const web3 = getWeb3()
  return web3.toAscii(bytes)
}

function getDefaultTxObj() {
  return {'from': getSelectedAccount()}
}

function toRegistryKey(string) {
  return getWeb3().sha3(string)
}

function waitForTxComplete(txHash, callback) {
  const web3 = getWeb3()

  console.log("TX Hash [" + txHash + "]")

  web3.eth.getTransactionReceipt(txHash, function (error, result) {
    if(error !== null) {
        callback(error, result)
        return
    }

    callback(null, result)
  })
}
