export class ContractRegistry {
  constructor (config) {
    this.config = config
    this.contractCache = {}
  }

  has(address) {
    return !!this.contractCache[address]
  }

  get(address, contractKey, web3) {
    var contract = this.contractCache[address]
    if (!contract) {
      if (!contractKey) {
        throw `No contract found for address ${address}, you must pass a contractKey for it to be constructed`
      }
      contract = this.config.contractFactories[contractKey](web3, address)
      this.contractCache[address] = contract
    }
    return contract
  }
}
