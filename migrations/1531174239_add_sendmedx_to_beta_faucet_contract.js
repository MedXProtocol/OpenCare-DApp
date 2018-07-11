var deployAndRegister = require('./support/deploy-and-register')
var toRegistryKey = require('./support/to-registry-key')

const BetaFaucet = artifacts.require("./BetaFaucet.sol");
const Registry = artifacts.require("./Registry.sol");
const MedXToken = artifacts.require("./MedXToken.sol");

module.exports = function(deployer) {
  // Because deployer needs to be the first thing run in a migration:
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()
    const medXTokenInstance = await MedXToken.deployed()
    const betaFaucetDelegate = await registryInstance.lookup(toRegistryKey('BetaFaucet'))

    return deployAndRegister(deployer, BetaFaucet, Registry, 'BetaFaucetTarget').then(() => {
      return BetaFaucet.at(betaFaucetDelegate).then(delegateInstance => {
        return delegateInstance.updateMedXTokenAddress(medXTokenInstance.address)
      })
    })
  })
};
