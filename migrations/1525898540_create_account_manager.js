const AccountManager = artifacts.require("AccountManager.sol");
const deployWithDelegate = require('./support/deployWithDelegate')

module.exports = function(deployer) {
  deployWithDelegate(artifacts, deployer, AccountManager)
};
