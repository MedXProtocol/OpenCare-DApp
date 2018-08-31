const CaseSecondPhaseManager = artifacts.require('CaseSecondPhaseManager.sol')
const Registry = artifacts.require('Registry.sol')
const deployAndRegister = require('./support/deploy-and-register')

module.exports = function(deployer) {
  return deployAndRegister(deployer, CaseSecondPhaseManager, Registry, 'CaseSecondPhaseManagerTarget')
};
