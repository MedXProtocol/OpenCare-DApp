const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
const promisify = require('../test/helpers/promisify').promisify

const BetaFaucet = artifacts.require("./BetaFaucet.sol");
const Registry = artifacts.require("./Registry.sol");
const MedXToken = artifacts.require("./MedXToken.sol");

module.exports = function(deployer, networkName) {
  deployer.then(async () => {
    const medXTokenInstance = await MedXToken.deployed()

    if (deployer.network_id !== 1) { // if not mainnet
      return deployTargetAndDelegate(artifacts, deployer, BetaFaucet, networkName).then(betaFaucetDelegateInstance => {
        return betaFaucetDelegateInstance.updateMedXTokenAddress(medXTokenInstance.address)
      })
    }
  })
};
