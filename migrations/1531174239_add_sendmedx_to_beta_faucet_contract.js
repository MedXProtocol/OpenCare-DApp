var deploy = require('./support/deploy')

let BetaFaucet = artifacts.require("./BetaFaucet.sol");

const MedXToken = artifacts.require("./MedXToken.sol");

module.exports = function(deployer) {
  deployer.then(() => {
    return MedXToken.deployed().then(medXTokenInstance => {
      return deploy(artifacts, deployer, BetaFaucet).then((betaFaucet) => {
        return betaFaucet.initialize(medXTokenInstance.address)
      })
    })
  })
};
