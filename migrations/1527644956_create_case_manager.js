var deployWithDelegate = require('./support/deployWithDelegate')

const CaseManager = artifacts.require("./CaseManager.sol")

module.exports = function(deployer, network, accounts) {
  deployWithDelegate(artifacts, deployer, CaseManager)
}
