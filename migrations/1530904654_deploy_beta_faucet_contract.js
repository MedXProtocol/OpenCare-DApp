var deploy = require('./support/deploy')

let BetaFaucet = artifacts.require("./BetaFaucet.sol");

module.exports = function(deployer) {
  deploy(artifacts, deployer, BetaFaucet).then((betaFaucet) => {
    return betaFaucet.initialize()
  })
};
