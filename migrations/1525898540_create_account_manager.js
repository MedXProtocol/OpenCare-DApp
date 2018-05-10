const AccountManager = artifacts.require("AccountManager.sol");
const deploy = require('./support/deploy')

module.exports = function(deployer) {
  deploy(artifacts, deployer, AccountManager)
};
