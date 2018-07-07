import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/emO8rPnBiGuzIJx5vMzk'));

const contractAddresses = require('../../networks/3.json')
const betaFaucetArtifact = require("../../build/contracts/BetaFaucet.json");
const registryArtifact = require("../../build/contracts/Registry.json");

export const validateAddresses = function(privateKey, contractOwnerAddress, ethAddress) {
  if (privateKey.length != 66)
    throw new Error('privateKey is not the correct length (Could need leading "0x")');

  contractOwnerAddress = contractOwnerAddress.toLowerCase()
  // if (!web3.isAddress(contractOwnerAddress))
    // throw new Error('contractOwnerAddress is not a valid Ethereum address (Could need leading "0x")');

  ethAddress = ethAddress.toLowerCase()
  // if (!web3.isAddress(ethAddress))
    // throw new Error('ethAddress / recipient is not a valid Ethereum address (Could need leading "0x")');
}

// function encodeFunctionCall(functionName, functionInputs, ...args) {
//   return web3.eth.abi.encodeFunctionCall({
//     name: functionName,
//     type: 'function',
//     inputs: functionInputs
//   }, args);
// }

export const getContractFromRegistry = async function(contractName) {
  const contractKey = web3.utils.sha3(contractName)

  const registryAddress = contractAddresses.contracts
    .reverse()
    .find(contract => contract.contractName === 'Registry')
    .address

  const Registry = new web3.eth.Contract(registryArtifact.abi, registryAddress)
  Registry.setProvider(web3.currentProvider)

  const betaFaucetContractAddress = await Registry.methods.lookup(contractKey).call();

  return new web3.eth.Contract(betaFaucetArtifact.abi, betaFaucetContractAddress)
}

// export const nextNonce = async function(contractOwnerAddress) {
//   let lastConfirmedTxNonce = await promisify(cb => web3.eth.getTransactionCount(contractOwnerAddress, cb));
//   return lastConfirmedTxNonce + 1;
// }

// export const buildContractTxObject = async function(contractOwnerAddress, functionName, functionInputs, recipientAddress) {
//   var nonce = await nextNonce(contractOwnerAddress);
//   console.log('*************')
//   console.log('nonce: ' + nonce)
//   console.log('*************')

//   const betaFaucetContractAddress = await getContractFromRegistry("BetaFaucet")
//   console.log('****************')
//   console.log('betaFaucetContractAddress ... ', betaFaucetContractAddress)
//   console.log('****************')


//   let data = encodeFunctionCall(functionName, functionInputs, recipientAddress)
//   // console.log(data)
//   const txObject = {
//     to: betaFaucetContractAddress,
//     data: data,
//     gas: web3.utils.toHex(132114),
//     gasPrice: web3.utils.toHex(web3.utils.toWei('92', 'gwei')),
//     from: contractOwnerAddress,
//     nonce: nonce
//   }
//   console.log('built txObject: ' + JSON.stringify(txObject, null, 4));

//   return txObject
// }

// export const signTransaction = async function(txObject) {
//   let rawTx

//   await web3.eth.accounts.signTransaction(txObject, PRIVATE_KEY)
//     .then(result => {
//       console.log(result);
//       rawTx = result.rawTransaction
//     })
//     .catch(console.error);

//   return rawTx
// }

// export const sendSignedTransaction = async function(rawTx) {
//   let promiEvent = web3.eth.sendSignedTransaction(rawTx)
//     .on('transactionHash', function(txHash) {
//       console.log("txHash is: " + txHash)
//       return txHash
//     })
//     // .on('receipt', function(a) {console.log(a)})
//     // .on('confirmation', function(a) {console.log(a)})
//     .catch(error => {
//       console.error(error);
//     });

//   console.log('promiEvent is: ' + promiEvent);

//   return promiEvent;
// }

// Sending data to a contract's function
export const sendSignedContractTransaction = async function(
  contractOwnerAddress,
  functionName,
  functionInputs,
  ethAddress
) {
  const privateKey = process.env.LAMBDA_CONFIG_PRIVKEY;
  // console.log(privateKey, contractOwnerAddress, ethAddress)
  validateAddresses(privateKey, contractOwnerAddress, ethAddress)

  const contractOwnerAccount = web3.eth.accounts.wallet.add(privateKey);

  const betaFaucetContract = await getContractFromRegistry("BetaFaucet")
  // console.log(betaFaucetContract)
  // console.log(betaFaucetContract.address)

  betaFaucetContract.methods.sendEther(ethAddress).send({
    from: contractOwnerAddress,
    gas: web3.utils.toHex(132114),
    gasPrice: web3.utils.toHex(web3.utils.toWei('92', 'gwei'))
  })

  // const txObject = await buildContractTxObject(
  //   contractOwnerAddress,
  //   functionName,
  //   functionInputs,
  //   ethAddress
  // );
  // const rawTx = await signTransaction(txObject)
  // const promiEvent = await sendSignedTransaction(rawTx);

  // return promiEvent;
}
