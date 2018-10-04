const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
const FromBlockNumber = artifacts.require("./FromBlockNumber.sol")

module.exports = function(deployer, networkName) {
  return deployTargetAndDelegate(artifacts, deployer, FromBlockNumber, networkName)
}
