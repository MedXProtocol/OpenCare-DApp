var deployAndRegister = require('./support/deploy-and-register')

let Case = artifacts.require("./Case.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    return deployAndRegister(deployer, Case, Registry, 'Case')
  })
};
