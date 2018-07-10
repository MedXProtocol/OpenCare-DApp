import Web3 from 'web3'
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.LAMBDA_CONFIG_PROVIDER_URL))

const contractAddresses = require(`../../networks/${process.env.LAMBDA_CONFIG_NETWORK_ID}.json`)
const betaFaucetArtifact = require("../../build/contracts/BetaFaucet.json")
const registryArtifact = require("../../build/contracts/Registry.json")

const validateAddresses = function(privateKey, contractOwnerAddress, ethAddress) {
  if (privateKey.length != 66)
    throw new Error('privateKey is not the correct length (Could need leading "0x")')

  if (!web3.utils.isAddress(contractOwnerAddress))
    throw new Error('contractOwnerAddress is not a valid Ethereum address (Could need leading "0x"): ' + contractOwnerAddress)
  contractOwnerAddress = contractOwnerAddress.toLowerCase()

  if (!web3.utils.isAddress(ethAddress))
    throw new Error('ethAddress / recipient is not a valid Ethereum address (Could need leading "0x"): ' + ethAddress)
  ethAddress = ethAddress.toLowerCase()
}

const getContractAddressFromRegistry = async function(contractName) {
  const contractKey = web3.utils.sha3(contractName)

  const registryAddress = contractAddresses.contracts
    .reverse()
    .find(contract => contract.contractName === 'Registry')
    .address

  const Registry = new web3.eth.Contract(registryArtifact.abi, registryAddress)
  Registry.setProvider(web3.currentProvider)

  const betaFaucetContractAddress = await Registry.methods.lookup(contractKey).call()
  console.log(`BetaFaucet Delegate from the Registry is: ${betaFaucetContractAddress}`)

  return betaFaucetContractAddress
}

// Sending data to a contract's function
export const signTransaction = async function(contractOwnerAddress, ethAddress) {
  const privateKey = process.env.LAMBDA_CONFIG_PRIVKEY
  validateAddresses(privateKey, contractOwnerAddress, ethAddress)

  const betaFaucetContractAddress = await getContractAddressFromRegistry("BetaFaucet")

  const betaFaucetContract = new web3.eth.Contract(betaFaucetArtifact.abi, betaFaucetContractAddress)

  const encodedABI = betaFaucetContract.methods.sendEther(ethAddress).encodeABI()

  const tx = {
    from: contractOwnerAddress,
    to: betaFaucetContractAddress,
    gas: 2000000,
    data: encodedABI
  }

  const signed = await web3.eth.accounts.signTransaction(tx, privateKey)

  return signed
}
