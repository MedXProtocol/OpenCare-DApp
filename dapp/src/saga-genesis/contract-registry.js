export class ContractRegistry {
  constructor () {
    this.contracts = {}
    this.nameAlias = {}
  }

  add(web3Contract, optionalName) {
    this.contracts[web3Contract.options.address] = web3Contract
    if (optionalName) {
      this.addNameAlias(optionalName, web3Contract.options.address)
    }
    return web3Contract.options.address
  }

  hasAddress(address) {
    return !!this.contracts[address]
  }

  hasName(name) {
    return !!this.nameAlias[name]
  }

  addNameAlias(name, address) {
    this.nameAlias[name] = address
  }

  addressByName(name) {
    const contract = this.contracts[this.nameAlias[name]]
    let result = null
    if (contract) {
      result = contract.options.address
    }
    return result
  }

  findByName(name) {
    return this.contracts[this.nameAlias[name]]
  }

  requireByName(name) {
    const contract = this.findByName(name)
    if (!contract) { throw `Unable to find contract with name ${name}` }
    return contract
  }

  findByAddress(address) {
    return this.contracts[address]
  }

  requireByAddress(address) {
    const contract = this.findByAddress(address)
    if (!contract) { throw `Unable to find contract with address ${address}` }
    return contract
  }
}
