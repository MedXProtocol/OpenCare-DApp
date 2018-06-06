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

export async function contractFromConfig (config, address) {
  const web3 = getWeb3()
  if (!address) {
    let networkId = await web3.eth.net.getId()
    if (!networkId) throw 'No network'
    address = config.networks[networkId].address
  }
  let account = await getSelectedAccount()
  return new web3.eth.Contract(config.abi, address)
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

async function getDefaultTxOptions() {
  const account = await getSelectedAccount()
  return {
    from: account
  }
}
