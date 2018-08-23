var deployAndRegister = require('./support/deploy-and-register')

let CaseManager = artifacts.require("./CaseManager.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  return deployAndRegister(deployer, CaseManager, Registry, 'CaseManagerTarget')
};
