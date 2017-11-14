var caseFactoryAddress = "0x080fbb6303a5870cdcec645307c042f0e08d952d";
var medXTokenAddress = "0x36b71cd63c65dd47ffea48a965b04beda534a56c";
var doctorManagerAddress = "0x24c795af4d46b895e51081ac5d9ee575aaefe1fc";

var caseFactoryAbi = [
    {
        "constant": true,
        "inputs": [],
        "name": "medXToken",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getAllCaseListCount",
        "outputs": [
            {
                "name": "_caseCount",
                "type": "uint256"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "unpause",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            },
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "patientCases",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "paused",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "pause",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            },
            {
                "name": "_token",
                "type": "address"
            },
            {
                "name": "_extraData",
                "type": "bytes"
            }
        ],
        "name": "receiveApproval",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_doctorManagerContract",
                "type": "address"
            }
        ],
        "name": "setDoctorManager",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "doctorManager",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "caseList",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "caseFee",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_newCaseFee",
                "type": "uint256"
            }
        ],
        "name": "setBaseCaseFee",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_patient",
                "type": "address"
            }
        ],
        "name": "getPatientCaseListCount",
        "outputs": [
            {
                "name": "_caseCount",
                "type": "uint256"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "_baseCaseFee",
                "type": "uint256"
            },
            {
                "name": "_medXToken",
                "type": "address"
            },
            {
                "name": "_doctorManager",
                "type": "address"
            }
        ],
        "payable": false,
        "type": "constructor"
    },
    {
        "payable": false,
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "Pause",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "Unpause",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    }
];
var medXTokenAbi = [
    {
        "constant": true,
        "inputs": [],
        "name": "mintingFinished",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "mint",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_subtractedValue",
                "type": "uint256"
            }
        ],
        "name": "decreaseApproval",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "finishMinting",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            },
            {
                "name": "_extraData",
                "type": "bytes"
            }
        ],
        "name": "approveAndCall",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_addedValue",
                "type": "uint256"
            }
        ],
        "name": "increaseApproval",
        "outputs": [
            {
                "name": "success",
                "type": "bool"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "remaining",
                "type": "uint256"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "inputs": [],
        "payable": false,
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "Mint",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "MintFinished",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
];
var doctorManagerAbi = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "_doctor",
                "type": "address"
            }
        ],
        "name": "addDoctor",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_doctor",
                "type": "address"
            }
        ],
        "name": "isDoctor",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "name": "doctors",
        "outputs": [
            {
                "name": "isActive",
                "type": "bool"
            },
            {
                "name": "isCertified",
                "type": "bool"
            },
            {
                "name": "fee",
                "type": "uint256"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "inputs": [],
        "payable": false,
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    }
];
var medXCaseAbi = [
    {
        "constant": false,
        "inputs": [],
        "name": "rejectChallenegedDiagnosis",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_doctor",
                "type": "address"
            },
            {
                "name": "_encryptionKey",
                "type": "bytes32"
            }
        ],
        "name": "authorizeDoctor",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "status",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "medXToken",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "name": "authorizations",
        "outputs": [
            {
                "name": "status",
                "type": "uint8"
            },
            {
                "name": "doctorEncryptionKey",
                "type": "bytes32"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "diagnosingDoctorA",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_caseHash",
                "type": "bytes32"
            },
            {
                "name": "_encryptionKey",
                "type": "bytes32"
            }
        ],
        "name": "submitCase",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "diagnosingDoctorB",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "diagnosisLocationHash",
        "outputs": [
            {
                "name": "",
                "type": "bytes32"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_diagnosisHash",
                "type": "bytes32"
            }
        ],
        "name": "diagnoseCase",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "doctorManager",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "patient",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "confirmChallengedDiagnosis",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "originalEncryptionKey",
        "outputs": [
            {
                "name": "",
                "type": "bytes32"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "challengeDiagnosis",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "caseFee",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "cancelCase",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "requestAuthorization",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "caseDetailLocationHash",
        "outputs": [
            {
                "name": "",
                "type": "bytes32"
            }
        ],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "acceptDiagnosis",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "_patient",
                "type": "address"
            },
            {
                "name": "_caseFee",
                "type": "uint256"
            },
            {
                "name": "_token",
                "type": "address"
            },
            {
                "name": "_doctorManager",
                "type": "address"
            }
        ],
        "payable": false,
        "type": "constructor"
    },
    {
        "payable": false,
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_caseAddress",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_casePatient",
                "type": "address"
            }
        ],
        "name": "CaseCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_caseAddress",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_casePatient",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_caseDoctor",
                "type": "address"
            }
        ],
        "name": "CaseEvaluated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_caseAddress",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_casePatient",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_caseDoctor",
                "type": "address"
            }
        ],
        "name": "CaseClosed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_caseAddress",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_casePatient",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_caseDoctor",
                "type": "address"
            }
        ],
        "name": "CaseChallenged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_caseAddress",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_casePatient",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_caseDoctor",
                "type": "address"
            }
        ],
        "name": "CaseAuthorizationRequested",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_caseAddress",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_casePatient",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_caseDoctor",
                "type": "address"
            }
        ],
        "name": "CaseAuthorizationApproved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    }
];

var caseFactory, medXToken, doctorManager, medXCase, networkVersion, web3, currentUserAddress, bzz;

//var Web3 = require('web3');
var currentBlockAtPageLoad = 0;
var searchStartBlock = 0;
var accountsInitialized = false;

var ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
var LOGGING_ENABLED = true;
var ETHERSCAN_TX_URL;
var ETHERSCAN_ADDRESS_URL;
var ALERT_DISPLAY_TIME = 2500;
var SEARCH_HISTORY_LOOKBACK = 125000;

var CaseStatus = {
    "0": "Created",
    "1": "Open",
    "2": "Evaluated",
    "3": "Closed",
    "4": "Challenged",
    "5": "Canceled",
    "default": "None"
};

var AuthStatus = {
    "0": "None",
    "1": "Requested",
    "2": "Approved"
};

$(function() {
    setTimeout(function () {
        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof web3 !== 'undefined') {
            // Use Mist/MetaMask's provider
            web3 = new Web3(web3.currentProvider);
        } else {
            log('No web3? You should consider trying MetaMask!');
            // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
            //window.location = "no_metamask.html";
            web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        }

        bzz = web3.bzz;
        //bzz.setProvider("http://swarm-gateways.net");


        web3.eth.getBlock("latest", function (error, result) {
            log("Block Number: " + result.number);
        });

        networkVersion = getNetworkVersion();

        caseFactory = web3.eth.contract(caseFactoryAbi).at(caseFactoryAddress);
        medXToken = web3.eth.contract(medXTokenAbi).at(medXTokenAddress);
        doctorManager = web3.eth.contract(doctorManagerAbi).at(doctorManagerAddress);

        web3.eth.getAccounts(initializeAccounts);
    }, 500);
});

function getNetworkVersion() {
    web3.version.getNetwork(function (_err, _netId) {
        var version = _netId;
        switch (_netId) {
            case "1":
                ETHERSCAN_TX_URL = "https://etherscan.io/tx/";
                ETHERSCAN_ADDRESS_URL = "https://etherscan.io/address/";
                log('This is mainnet');
                window.location = "ropsten_only.html";
                break;
            case "3":
                ETHERSCAN_TX_URL = "https://ropsten.etherscan.io/tx/";
                ETHERSCAN_ADDRESS_URL = "https://ropsten.etherscan.io/address/";
                log('This is the ropsten test network.');
                break;
            default:
                ETHERSCAN_TX_URL = "";
                ETHERSCAN_ADDRESS_URL = "";
                log('This is an unknown network.')
        }
        return version;
    })
}

function initializeAccounts(_error, _result) {
    currentUserAddress = _result[0];
    web3.eth.getBlock("latest", function (error, result) {
        if (!error) {
            currentBlockAtPageLoad = result.number;
            searchStartBlock = currentBlockAtPageLoad - SEARCH_HISTORY_LOOKBACK;
            accountsInitialized = true;
        }
        else {
            console.error(error);
        }
    });
}

function initDataTable(_tableDomElement, _options) {
    return _tableDomElement.DataTable(_options);
}

function menuAuthorization(contract, $ownerOnlyMenuItem) {
    contract.owner(function(_error, _result) {
        if (currentUserAddress === _result) {
            $ownerOnlyMenuItem.show();
        } else {
            $ownerOnlyMenuItem.hide();
        }
    });
}

function waitForTxComplete(_txHash, _action, _callback) {
    web3.eth.getTransactionReceipt(_txHash, function (_error, _result) {
        if (_result !== null) {
            setCookieData({
                action: _action,
                txHash: _result.transactionHash,
                blockNumber: _result.blockNumber,
                gasUsed: _result.gasUsed,
                date: Date.now()
            }, web3.eth.defaultAccount);

            _callback(_result);
            return;
        }
        log("Waiting for tx to be mined....");
        setTimeout(function () {
            waitForTxComplete(_txHash, _action, _callback);
        }, 5000);
    });
}

function log(_message) {
    if (LOGGING_ENABLED) {
        console.log(_message);
    }
}

/*
 CookieData should be in the format
 {action: transactionEvents[i],
 txHash : txDetails.transactionHash,
 blockNumber : txDetails.blockNumber,
 gasUsed : txDetails.gasUsed
 date: Date.now()}
 */
function setCookieData(cookieData, currentAccount) {
    var cookieArray = [];
    if (currentAccount === undefined) { return; }
    if (Cookies.get(currentAccount) === undefined) {
        cookieArray.push(cookieData);
        Cookies.set(currentAccount, cookieArray);
    } else {
        $.each(Cookies.getJSON(currentAccount), function(index, element){
            cookieArray.push(element);
        });
        cookieArray.push(cookieData);
        Cookies.set(currentAccount, cookieArray);
    }
}

function formatDate(_date) {
    return moment(new Date(_date)).format("MM/DD/YYYY HH:mm:ss");
}

function formatDateNoTime(_date) {
    return moment(new Date(_date)).format("MM/DD/YYYY");
}

function displayAlert(messageType, content) {
    var timeId = new Date().getTime();
    var message = content;

    if (messageType === "danger")
        message = "<p><strong>Tx failed: </strong>" + content + "</p>";
    else if (messageType === "success")
        message = "<p><strong>Tx successful: </strong>" + content + "</p>";

    $('<div class="alert alert-' + messageType + ' alert-'+ timeId + ' floating-alert fade in"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button><div class="alert-content">' + message + '</div></div>').insertAfter($("body"));

    setTimeout(function () {
        $(".alert-" + timeId).alert('close');
    }, ALERT_DISPLAY_TIME);
}

function updateAccountBalance(_medXBalanceLbl) {
    medXToken.balanceOf(currentUserAddress, function(_error, _medXBalance) {
        $medXBalanceLbl.html(_medXBalance + " MEDX");
    });
}