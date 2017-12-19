import medXTokenContractConfig from '../config/contracts/medXToken.json';
import caseFactoryContractConfig from '../config/contracts/caseFactory.json';
import caseContractConfig from '../config/contracts/case.json';
import doctorManagerContractConfig from '../config/contracts/doctorManager.json';
import { promisify } from './common-util';

export function getSelectedAccount() {
    const { web3 } = window;

    return web3.eth.accounts[0];
}

export function fromTokenDecimal(tokenAmount) {
    return tokenAmount * 10**18;
}

export function isDoctor() {
    const contract = getDoctorManagerContract();
    const selectedAccount = getSelectedAccount();

    return promisify(cb => contract.isDoctor(selectedAccount, cb));
}

export async function getSelectedAccountBalance() {
    const selectedAccount = getSelectedAccount();
    const contract = getMedXTokenContract();

    const balance = promisify(cb => contract.balanceOf(selectedAccount, cb));

    return balance / 10**18;
}

export async function getMedXTokenBalance(account) {
    const contract = getMedXTokenContract();

    return promisify(cb => contract.balanceOf(account, cb));
}

export function mintMedXTokens(account, amount, callback) {
    const contract = getMedXTokenContract();
    contract
        .mint(account, amount, getDefaultTxObj(), function(error, result) {
            if(error !== null){
                callback(error, result);
            } else {
                waitForTxComplete(result, callback);
            }
        });
}

export function createCase(documentHash, callback) {
    const contract = getMedXTokenContract();
    const caseFactoryAddress = caseFactoryContractConfig.address;

    contract
        .approveAndCall(caseFactoryAddress, fromTokenDecimal(15), documentHash, getDefaultTxObj(), function(error, result){
            if(error !== null) {
                callback(error, result);
            } else {
                waitForTxComplete(result, callback);
            }
        });
}

export async function getCaseStatus(caseAddress) {
    const contract = getCaseContract(caseAddress);

    const status = (await promisify(cb => contract.status(cb))).toNumber();

    return {
        code: status,
        name: getCaseStatusName(status)
    }
}

export async function getCaseDetailsLocationHash(caseAddress) {
    const contract = getCaseContract(caseAddress);

    return getFileHashFromBytes(await promisify(cb => contract.caseDetailLocationHash(cb)));
}

export async function getCaseDoctorADiagnosisLocationHash(caseAddress) {
    const contract = getCaseContract(caseAddress);
    
    return getFileHashFromBytes(await promisify(cb => contract.diagnosisALocationHash(cb)));
}

export async function getCaseDoctorBDiagnosisLocationHash(caseAddress) {
    const contract = getCaseContract(caseAddress);
    
    return getFileHashFromBytes(await promisify(cb => contract.diagnosisBLocationHash(cb)));
}

export async function getAllCasesForCurrentAccount() {
    const contract = getCaseFactoryContract();
    const account = getSelectedAccount();

    const count = await promisify(cb => contract.getPatientCaseListCount(account, cb));

    let cases = [];
    
    for(let i = 0; i < count; i++) {
        const caseContractAddress = await promisify(cb => contract.patientCases(account, i, cb));

        const caseContract = getCaseContract(caseContractAddress);
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
    const contract = getCaseFactoryContract();
    
    const count = await promisify(cb => contract.getAllCaseListCount(cb));

    for(let i = 0; i < count; i++) {
        const caseContractAddress = await promisify(cb => contract.caseList(i, cb));

        const caseContract = getCaseContract(caseContractAddress);
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

export function registerDoctor(address, callback) {
    const contract = getDoctorManagerContract();
    contract
        .addDoctor(address, getDefaultTxObj(), function(error, result) {
            if(error !== null){
                callback(error, result);
            } else {
                waitForTxComplete(result, callback);
            }
        });
}

export function acceptDiagnosis(caseAddress, callback) {
    const contract = getCaseContract(caseAddress);
    
        contract
            .acceptDiagnosis(getDefaultTxObj(), function(error, result) {
                if(error !== null){
                    callback(error, result);
                } else {
                    waitForTxComplete(result, callback);
                }
            });
}

export function challengeDiagnosis(caseAddress, callback) {
    const contract = getCaseContract(caseAddress);
    
        contract
            .challengeDiagnosis(getDefaultTxObj(), function(error, result) {
                if(error !== null){
                    callback(error, result);
                } else {
                    waitForTxComplete(result, callback);
                }
            });
}

export function diagnoseCase(caseAddress, diagnosisHash, callback) {
    const contract = getCaseContract(caseAddress);

    contract
        .diagnoseCase(diagnosisHash, getDefaultTxObj(), function(error, result) {
            if(error !== null){
                callback(error, result);
            } else {
                waitForTxComplete(result, callback);
            }
        });
}

export function diagnoseChallengedCase(caseAddress, diagnosisHash, accept, callback) {
    const contract = getCaseContract(caseAddress);
    
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

function getMedXTokenContract() {
    const { web3 } = window;

    const contract = web3.eth.contract(medXTokenContractConfig.abi);
    return contract.at(medXTokenContractConfig.address);
}

function getCaseFactoryContract() {
    const { web3 } = window;

    const contract = web3.eth.contract(caseFactoryContractConfig.abi);
    return contract.at(caseFactoryContractConfig.address);
}

function getCaseContract(address) {
    const { web3 } = window;

    const contract = web3.eth.contract(caseContractConfig.abi);
    return contract.at(address);
}

function getDoctorManagerContract() {
    const { web3 } = window;

    const contract = web3.eth.contract(doctorManagerContractConfig.abi);
    return contract.at(doctorManagerContractConfig.address);
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