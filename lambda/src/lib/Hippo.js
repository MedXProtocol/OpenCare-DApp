import Web3 from 'web3'

const betaFaucetArtifact = require("../../../build/contracts/BetaFaucet.json")
const registryArtifact = require("../../../build/contracts/Registry.json")

function fail(msg) {
  throw new Error(msg)
}

export class Hippo {
  constructor (config = {}) {
    this.privateKey = config.privateKey || fail('You must configure a private key')
    if (this.privateKey.length !== 66)
      fail('privateKey is not the correct length (Could need leading "0x")')
    this._providerUrl = config.providerUrl || fail('You must pass a provider URL')
    this._networkId = config.networkId || fail('You must pass a network id')
    this._web3 = new Web3(new Web3.providers.HttpProvider(this._providerUrl))
    this._account = this._web3.eth.accounts.wallet.add(this.privateKey)
  }

  web3() {
    return this._web3
  }

  ownerAddress() {
    return this._account.address
  }

  getRegistryContract () {
    const registryAddress = registryArtifact.networks[this._networkId].address
    const Registry = new this._web3.eth.Contract(registryArtifact.abi, registryAddress)
    Registry.setProvider(this._web3.currentProvider)
    return Registry
  }

  lookupContract (contractName) {
    const contractKey = this._web3.utils.sha3(contractName)
    return this.getRegistryContract().methods.lookup(contractKey).call()
      .then((address) => {
        return address
      })
  }

  lookupBetaFaucet () {
    return this.lookupContract('BetaFaucet')
      .then((address) => {
        return new this._web3.eth.Contract(betaFaucetArtifact.abi, address)
      })
  }

  sendTransaction (tx) {
    return this._web3.eth.sendTransaction(tx)
  }
}
