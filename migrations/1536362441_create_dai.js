const promisify = require('../test/helpers/promisify').promisify
const deployAndRegister = require('./support/deployAndRegister')
const toRegistryKey = require('./support/toRegistryKey')
const Registry = artifacts.require('./Registry.sol')
const Dai = artifacts.require('./Dai.sol')

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()
    const networkId = await promisify(cb => web3.version.getNetwork(cb))
    const key = 'Dai'
    const registryKey = toRegistryKey(key)
    switch(networkId) {
      case '1': //mainnet
        return registryInstance.register(registryKey, '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359')
      case '42': //kovan
        return registryInstance.register(registryKey, '0xc4375b7de8af5a38a93548eb8453a498222c4ff2')
      default: // localhost
        return deployAndRegister(deployer, Dai, Registry, key)
    }
  })
};
