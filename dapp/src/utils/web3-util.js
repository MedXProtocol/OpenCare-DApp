import medXTokenContractConfig from '#/MedXToken.json';
import caseFactoryContractConfig from '#/CaseFactory.json';
import caseContractConfig from '#/Case.json';
import doctorManagerContractConfig from '#/DoctorManager.json';
import registryConfig from '#/Registry.json';
import { promisify } from './common-util';
import { signedInSecretKey } from '@/services/sign-in'
import aesjs from 'aes-js'
import aes from '@/services/aes'

import truffleContract from 'truffle-contract'

export function getSelectedAccount() {
    const { web3 } = window;

    return web3.eth.accounts[0];
}

export async function isDoctor() {
    const contract = (await getDoctorManagerContract()).contract;
    const selectedAccount = getSelectedAccount();

    return promisify(cb => contract.isDoctor(selectedAccount, cb));
}

export async function getSelectedAccountBalance() {
  const selectedAccount = getSelectedAccount();
  const contract = await getMedXTokenContract();
  const balance = await contract.balanceOf(selectedAccount);
  return balance.toNumber();
}

export async function getMedXTokenBalance(account) {
    const contract = await getMedXTokenContract();

    return contract.balanceOf(account);
}

export async function mintMedXTokens(account, amount, callback) {
    const contract = await getMedXTokenContract();
    contract.mint(account, amount, getDefaultTxObj())
      .then((result) => {
        waitForTxComplete(result, callback);
      })
      .catch((error) => {
        callback(error)
      })
}

export async function createCase(encryptedCaseKey, documentHash, callback) {
    const contract = (await getMedXTokenContract()).contract;
    const caseFactory = (await getCaseFactoryContract()).contract;
    const caseFactoryAddress = caseFactory.address;

    var hashBytes = aesjs.utils.utf8.toBytes(documentHash)
    var hashHex = aesjs.utils.hex.fromBytes(hashBytes)
    const combined = '0x' + encryptedCaseKey + hashHex

    contract
        .approveAndCall(caseFactoryAddress, 15, combined, getDefaultTxObj(), function(error, result){
            if(error !== null) {
                callback(error, result);
            } else {
                waitForTxComplete(result, callback);
            }
        });
}

export async function getCaseStatus(caseAddress) {
    const contract = (await getCaseContract(caseAddress)).contract;

    const status = (await promisify(cb => contract.status(cb))).toNumber();

    return {
        code: status,
        name: getCaseStatusName(status)
    }
}

export async function getCaseKey(caseAddress) {
  const contract = await getCaseContract(caseAddress);
  let encryptedCaseKeyBytes = await contract.getEncryptedCaseKey()
  let encryptedCaseKey = encryptedCaseKeyBytes.map((hex) => hex.substring(2)).join('')
  var caseKey = aes.decrypt(encryptedCaseKey, signedInSecretKey())
  return caseKey
}

export async function getCaseDetailsLocationHash(caseAddress) {
    const contract = (await getCaseContract(caseAddress)).contract;

    return getFileHashFromBytes(await promisify(cb => contract.caseDetailLocationHash(cb)));
}

export async function getCaseDoctorADiagnosisLocationHash(caseAddress) {
    const contract = (await getCaseContract(caseAddress)).contract;

    return getFileHashFromBytes(await promisify(cb => contract.diagnosisALocationHash(cb)));
}

export async function getCaseDoctorBDiagnosisLocationHash(caseAddress) {
    const contract = (await getCaseContract(caseAddress)).contract;

    return getFileHashFromBytes(await promisify(cb => contract.diagnosisBLocationHash(cb)));
}

export async function getAllCasesForCurrentAccount() {
    const contract = (await getCaseFactoryContract()).contract;
    const account = getSelectedAccount();

    const count = await promisify(cb => contract.getPatientCaseListCount(account, cb));

    let cases = [];

    for(let i = 0; i < count; i++) {
        const caseContractAddress = await promisify(cb => contract.patientCases(account, i, cb));
        const caseContract = (await getCaseContract(caseContractAddress)).contract;
        const status = await promisify(cb => caseContract.status(cb));

        cases.push({
            number: i + 1,
            address: caseContractAddress,
            status: status.toNumber(),
            statusName: getCaseStatusName(status.toNumber())
        });
    }

    return cases;
}

export async function getNextCaseFromQueue() {
    const contract = (await getCaseFactoryContract()).contract;

    const count = await promisify(cb => contract.getAllCaseListCount(cb));

    for(let i = 0; i < count; i++) {
        const caseContractAddress = await promisify(cb => contract.caseList(i, cb));

        const caseContract = (await getCaseContract(caseContractAddress)).contract;
        const status = (await promisify(cb => caseContract.status(cb))).toNumber();

        //Only Open or Challenged cases
        if(status !== 1 && status !== 4)
            continue;

        //Challenged case can not be review by the same doctor
        if(status === 4 ) {
            const account = getSelectedAccount();
            const diagnosisADoctor = await promisify(cb => caseContract.diagnosingDoctorA(cb));

            if(account === diagnosisADoctor)
                continue;
        }

        return caseContractAddress;
    }

    return null;
}

export async function registerDoctor(address, callback) {
    const contract = (await getDoctorManagerContract()).contract;
    contract
        .addDoctor(address, getDefaultTxObj(), function(error, result) {
            if(error !== null){
                callback(error, result);
            } else {
                waitForTxComplete(result, callback);
            }
        });
}

export async function acceptDiagnosis(caseAddress, callback) {
    const contract = (await getCaseContract(caseAddress)).contract;

        contract
            .acceptDiagnosis(getDefaultTxObj(), function(error, result) {
                if(error !== null){
                    callback(error, result);
                } else {
                    waitForTxComplete(result, callback);
                }
            });
}

export async function challengeDiagnosis(caseAddress, callback) {
    const contract = (await getCaseContract(caseAddress)).contract;

        contract
            .challengeDiagnosis(getDefaultTxObj(), function(error, result) {
                if(error !== null){
                    callback(error, result);
                } else {
                    waitForTxComplete(result, callback);
                }
            });
}

export async function diagnoseCase(caseAddress, diagnosisHash, callback) {
    const contract = (await getCaseContract(caseAddress)).contract;

    contract
        .diagnoseCase(diagnosisHash, getDefaultTxObj(), function(error, result) {
            if(error !== null){
                callback(error, result);
            } else {
                waitForTxComplete(result, callback);
            }
        });
}

export async function diagnoseChallengedCase(caseAddress, diagnosisHash, accept, callback) {
    const contract = (await getCaseContract(caseAddress)).contract;

    contract
        .diagnoseChallengedCase(diagnosisHash, accept, getDefaultTxObj(), function(error, result) {
            if(error !== null){
                callback(error, result);
            } else {
                waitForTxComplete(result, callback);
            }
        });
}

function getCaseStatusName(status) {
    switch(status) {
        case 1:
            return "Open";
        case 2:
            return "Evaluated";
        case 3:
            return "Closed";
        case 4:
            return "Challenged";
        case 5:
            return "Canceled";
        case 6:
            return "Closed";
        case 7:
            return "Closed";
        default:
            return "";
    }
}

function contractFromConfig (config) {
  const contract = truffleContract(config)
  contract.setProvider(window.web3.currentProvider)
  contract.web3.eth.defaultAccount = window.web3.eth.accounts[0]
  return contract
}

function getMedXTokenContract() {
  return contractFromConfig(medXTokenContractConfig).deployed()
}

function getCaseFactoryContract() {
  return lookupContractAt('CaseFactory', caseFactoryContractConfig)
}

function getCaseContract(address) {
  return contractFromConfig(caseContractConfig).at(address)
}

function getDoctorManagerContract() {
  return lookupContractAt('DoctorManager', doctorManagerContractConfig)
}

function lookupContractAt(name, contractConfig) {
  return lookupContractAddress(name).then((address) => {
    return contractFromConfig(contractConfig).at(address)
  })
}

function lookupContractAddress(name) {
  return getRegistryContract().then((registry) => {
    return registry.lookup(toRegistryKey(name))
  })
}

function getRegistryContract() {
  return contractFromConfig(registryConfig).deployed()
}

function getFileHashFromBytes(bytes) {
    if(bytes === "0x")
        return null;

    const { web3 } = window;

    return web3.toAscii(bytes);
}

function getDefaultTxObj() {
    const { web3 } = window;

    return {'from': web3.eth.accounts[0]};
}

function toRegistryKey(string) {
  return window.web3.sha3(string)
}


function waitForTxComplete(txHash, callback) {
    const { web3 } = window;

    console.log("TX Hash [" + txHash + "]");

    web3.eth.getTransactionReceipt(txHash, function (error, result) {
        if(error !== null) {
            callback(error, result);
            return;
        }

        callback(null, result);

        /*if (result !== null) {
            callback(null, result);
            return;
        }
        console.log("Waiting for tx to be mined....");
        setTimeout(function () {
            waitForTxComplete(txHash, callback);
        }, 5000);*/
    });
}
