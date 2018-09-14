const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
const AdminSettings = artifacts.require("./AdminSettings.sol")

module.exports = function(deployer, network, accounts) {
  deployTargetAndDelegate(artifacts, deployer, AdminSettings)
}
