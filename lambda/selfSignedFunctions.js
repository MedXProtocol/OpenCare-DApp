const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/emO8rPnBiGuzIJx5vMzk'))
const contractAddresses = require('../networks/3.json')
const contract = require("truffle-contract");
const contractJson = require("../build/contracts/Registry.json");

export const validateAddresses = function(contractOwnerAddress, ethAddress) {
  const PRIVATE_KEY = process.env.LAMBDA_CONFIG_PRIVKEY;
  if (PRIVATE_KEY.length != 66)
    throw new Error('PRIVATE_KEY is not the correct length (Could need leading "0x")');
  if (!web3.isAddress(contractOwnerAddress))
    throw new Error('contractOwnerAddress is not a valid Ethereum address (Could need leading "0x")');
  if (!web3.isAddress(ethAddress))
    throw new Error('ethAddress / recipient is not a valid Ethereum address (Could need leading "0x")');
}

function encodeFunctionCall(functionName, functionInputs, ...args) {
  return web3.eth.abi.encodeFunctionCall({
    name: functionName,
    type: 'function',
    inputs: functionInputs
  }, args);
}

export const getContractAddress = async function(contractName) {
  const Registry = contract(contractJson);
  const registryAddress = contractAddresses.contracts
    .reverse()
    .find(contract => contract.contractName === 'Registry')
    .address

  return await Registry.at(registryAddress).registry.lookup(keccak256(contractName));
}

export const nextNonce = async function(contractOwnerAddress) {
  let lastConfirmedTxNonce

  return new Promise((resolve, reject) => {
    web3.eth.getTransactionCount(contractOwnerAddress)
      .then(lastConfirmedTxNonce => resolve(lastConfirmedTxNonce + 1))
      .catch((error) => reject(error))
  });
}

export const buildContractTxObject = async function(contractOwnerAddress, functionName, functionInputs, recipientAddress) {
  var nonce = await nextNonce();
  console.log('*************')
  console.log('nonce: ' + nonce)
  console.log('*************')

  const betaFaucetContractAddress = await getContractAddress("BetaFaucet")
  console.log('****************')
  console.log('betaFaucetContractAddress ... ', betaFaucetContractAddress)
  console.log('****************')


  let data = encodeFunctionCall(functionName, functionInputs, recipientAddress)
  // console.log(data)
  const txObject = {
    to: betaFaucetContractAddress,
    data: data,
    gas: web3.utils.toHex(132114),
    gasPrice: web3.utils.toHex(web3.utils.toWei('92', 'gwei')),
    from: contractOwnerAddress,
    nonce: nonce
  }
  console.log('built txObject: ' + JSON.stringify(txObject, null, 4));

  return txObject
}

export const signTransaction = async function(txObject) {
  let rawTx

  await web3.eth.accounts.signTransaction(txObject, PRIVATE_KEY)
    .then(result => {
      console.log(result);
      rawTx = result.rawTransaction
    })
    .catch(console.error);

  return rawTx
}

export const sendSignedTransaction = async function(rawTx) {
  let promiEvent = web3.eth.sendSignedTransaction(rawTx)
    .on('transactionHash', function(txHash) {
      console.log("txHash is: " + txHash)
      return txHash
    })
    // .on('receipt', function(a) {console.log(a)})
    // .on('confirmation', function(a) {console.log(a)})
    .catch(error => {
      console.error(error);
    });

  console.log('promiEvent is: ' + promiEvent);

  return promiEvent;
}

// Sending data to a contract's function
export const sendSignedContractTransaction = async function(
  contractOwnerAddress,
  functionName,
  functionInputs,
  ethAddress
) {
  validateAddresses(contractOwnerAddress, ethAddress)

  const txObject = await buildContractTxObject(
    contractOwnerAddress,
    functionName,
    functionInputs,
    ethAddress
  );
  const rawTx = await signTransaction(txObject)
  const promiEvent = await sendSignedTransaction(rawTx);

  return promiEvent;
}
