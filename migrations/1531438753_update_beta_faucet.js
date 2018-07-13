var deployAndRegister = require('./support/deploy-and-register')

let BetaFaucet = artifacts.require("./BetaFaucet.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployAndRegister(deployer, BetaFaucet, Registry, 'BetaFaucetTarget')
};
