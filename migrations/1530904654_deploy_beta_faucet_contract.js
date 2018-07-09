var deploy = require('./support/deploy')

let BetaFaucet = artifacts.require("./BetaFaucet.sol");

const MedXToken = artifacts.require("./MedXToken.sol");

module.exports = async function(deployer) {
  let medXTokenInstance = await MedXToken.deployed()
  return deploy(artifacts, deployer, BetaFaucet).then((betaFaucet) => {
    return betaFaucet.initialize(medXTokenInstance.address)
  })
};
