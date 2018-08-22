const promisify = require('../test/helpers/promisify').promisify
const deployAndRegister = require('./support/deploy-and-register')
const toRegistryKey = require('./support/to-registry-key')
const Registry = artifacts.require('./Registry.sol')
const EtherPriceFeed = artifacts.require('./EtherPriceFeed.sol')

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()
    const networkId = await promisify(cb => web3.version.getNetwork(cb))
    const key = 'EtherPriceFeed'
    switch(networkId) {
      case '1': //mainnet
        return registryInstance.register(key, '0x729D19f657BD0614b4985Cf1D82531c67569197B')
      case '42': //kovan
        return registryInstance.register(key, '0xa944bd4b25c9f186a846fd5668941aa3d3b8425f')
      default: // localhost
        return deployAndRegister(deployer, EtherPriceFeed, Registry, key)
    }
  })
};
