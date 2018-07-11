const deployWithDelegate = require('./support/deployWithDelegate')
const BetaFaucet = artifacts.require("./BetaFaucet.sol");

module.exports = function(deployer) {
  deployWithDelegate(artifacts, deployer, BetaFaucet).then((betaFaucet) => {
    return betaFaucet.initialize()
  })
};
