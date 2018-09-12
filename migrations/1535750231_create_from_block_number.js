const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
const FromBlockNumber = artifacts.require("./FromBlockNumber.sol")

module.exports = function(deployer) {
  return deployTargetAndDelegate(artifacts, deployer, FromBlockNumber).then((fromBlockNumber) => {
  })
}
