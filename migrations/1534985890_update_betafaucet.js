const BetaFaucet = artifacts.require('BetaFaucet.sol')
const Registry = artifacts.require('Registry.sol')
const deployAndRegister = require('./support/deploy-and-register')

module.exports = function(deployer) {
  return deployAndRegister(deployer, BetaFaucet, Registry, 'BetaFaucetTarget')
};
