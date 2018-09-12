const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')

const BetaFaucet = artifacts.require("./BetaFaucet.sol");
const Registry = artifacts.require("./Registry.sol");
const MedXToken = artifacts.require("./MedXToken.sol");

module.exports = function(deployer) {
  deployer.then(async () => {
    const medXTokenInstance = await MedXToken.deployed()

    return deployTargetAndDelegate(artifacts, deployer, BetaFaucet).then(betaFaucetDelegateInstance => {
      return betaFaucetDelegateInstance.updateMedXTokenAddress(medXTokenInstance.address)
    })
  })
};
