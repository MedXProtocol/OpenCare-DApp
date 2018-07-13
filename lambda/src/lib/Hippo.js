const Eth = require('ethjs')
const abi = require('ethjs-abi')
const SignerProvider = require('ethjs-provider-signer')
const sign = require('ethjs-signer').sign
const privateToAccount = require('ethjs-account').privateToAccount

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
    this._account = privateToAccount(this.privateKey)
    // this._eth = new Eth(new SignerProvider(this._providerUrl, {
    //   signTransaction: (rawTx, cb) => cb(null, sign(rawTx, this._account.privateKey)),
    //   accounts: (cb) => cb(null, [this._account.address]),
    // }))
    this._eth = new Eth(new Eth.HttpProvider(this._providerUrl))
  }

  ownerAddress() {
    return this._account.address
  }

  getRegistryContract () {
    const registryAddress = registryArtifact.networks[this._networkId].address
    const Registry = new this._eth.contract(registryArtifact.abi).at(registryAddress)
    return Registry
  }

  lookupContractAddress (contractName) {
    return this.getRegistryContract().lookup(Eth.keccak256(contractName))
  }

  lookupBetaFaucet () {
    return this.lookupContractAddress('BetaFaucet')
      .then((address) => {
        return new this._eth.contract(betaFaucetArtifact.abi).at(address)
      })
      .catch(error => fail(error))
  }

  sendTransaction (tx) {
    // return this._eth.sendTransaction(tx)
    return this._eth.getTransactionCount(this._account.address, 'pending')
      .then((nonce) => {
        tx.nonce = nonce.toString()
        return this._eth.sendRawTransaction(sign(tx, this._account.privateKey))
      })
      .catch(error => fail(error))
  }

  sendEther (ethAddress) {
    return this.lookupContractAddress('BetaFaucet').then((betaFaucetAddress) => {
      const method = betaFaucetArtifact.abi.find((obj) => obj.name === 'sendEther')
      var data = abi.encodeMethod(method, [ethAddress])
      const tx = {
        from: this.ownerAddress(),
        to: betaFaucetAddress[0],
        gas: 4612388,
        gasPrice: Eth.toWei(20, 'gwei').toString(),
        data
      }
      console.info('sendEther tx: ', tx)
      return this.sendTransaction(tx)
    })
  }

  sendMedX (ethAddress) {
    return this.lookupContractAddress('BetaFaucet').then((betaFaucetAddress) => {
      const method = betaFaucetArtifact.abi.find((obj) => obj.name === 'sendMedX')
      var data = abi.encodeMethod(method, [ethAddress, 500])
      const tx = {
        from: this.ownerAddress(),
        to: betaFaucetAddress[0],
        gas: 4612388,
        gasPrice: Eth.toWei(20, 'gwei').toString(),
        data
      }
      console.info('sendMedX tx: ', tx)
      return this.sendTransaction(tx)
    })
  }
}
