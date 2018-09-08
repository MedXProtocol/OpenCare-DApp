const deployWithDelegate = require('./support/deployWithDelegate')

let CasePaymentManager = artifacts.require("./CasePaymentManager.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployWithDelegate(artifacts, deployer, CasePaymentManager)
};
