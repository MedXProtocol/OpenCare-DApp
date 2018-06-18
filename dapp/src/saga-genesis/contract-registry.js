export class ContractRegistry {
  constructor (config) {
    this.config = config
    this.contractCache = {}
  }

  has(address) {
    if (address) {
      address = address.toLowerCase()
    }
    return !!this.contractCache[address]
  }

  get(address, contractKey, web3) {
    if (address) {
      address = address.toLowerCase()
    }
    var contract = this.contractCache[address]
    if (!contract) {
      if (!contractKey) {
        throw new Error(`No contract found for address ${address}, you must pass a contractKey for it to be constructed`)
      }
      contract = this.config.contractFactories[contractKey](web3, address)
      this.contractCache[address] = contract
    }
    return contract
  }
}
