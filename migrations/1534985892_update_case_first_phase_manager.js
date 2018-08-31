const CaseFirstPhaseManager = artifacts.require('CaseFirstPhaseManager.sol')
const Registry = artifacts.require('Registry.sol')
const deployAndRegister = require('./support/deploy-and-register')

module.exports = function(deployer) {
  return deployAndRegister(deployer, CaseFirstPhaseManager, Registry, 'CaseFirstPhaseManagerTarget')
};
