const Case = artifacts.require('Case.sol')
const Registry = artifacts.require('Registry.sol')
const deployAndRegister = require('./support/deploy-and-register')

module.exports = function(deployer) {
  return deployAndRegister(deployer, Case, Registry, 'Case')
};
