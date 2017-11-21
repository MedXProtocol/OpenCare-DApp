import medXTokenContract from '../assets/contracts/medXToken.json'
import caseFactoryContract from '../assets/contracts/caseFactory.json'

export function getSelectedAccount(){
    const { web3 } = window;

    return web3.eth.accounts[0];
}

export function getCaseFactoryContract(){
    const { web3 } = window;

    const contract = web3.eth.contract(caseFactoryContract.abi); // eslint-disable-line 
    return contract.at(caseFactoryContract.address);
}

function getDefaultTxObj() {
    const { web3 } = window;

    return {'from': web3.eth.accounts[0]}; // eslint-disable-line 
}

export function waitForTxComplete(txHash, callback) {
    const { web3 } = window;

    web3.eth.getTransactionReceipt(txHash, function (error, result) { // eslint-disable-line 
        if (result !== null) {
            callback(result);
            return;
        }
        console.log("Waiting for tx to be mined....");
        setTimeout(function () {
            waitForTxComplete(txHash, callback);
        }, 5000);
    });
}