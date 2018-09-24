const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
const CaseManager = artifacts.require("./CaseManager.sol")

module.exports = function(deployer, network, accounts) {
  deployTargetAndDelegate(artifacts, deployer, CaseManager)
}
