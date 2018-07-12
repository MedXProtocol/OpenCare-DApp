var deployWithDelegate = require('./support/deployWithDelegate')

const BetaFaucet = artifacts.require("./BetaFaucet.sol");
const Registry = artifacts.require("./Registry.sol");
const MedXToken = artifacts.require("./MedXToken.sol");

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()
    const medXTokenInstance = await MedXToken.deployed()

    return deployWithDelegate(artifacts, deployer, BetaFaucet).then(betaFaucetDelegateInstance => {
      betaFaucetDelegateInstance.initialize()
      return betaFaucetDelegateInstance.updateMedXTokenAddress(medXTokenInstance.address)
    })
  })
};
