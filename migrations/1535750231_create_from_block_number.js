const deployWithDelegate = require('./support/deployWithDelegate')
const FromBlockNumber = artifacts.require("./FromBlockNumber.sol")

module.exports = function(deployer) {
  return deployWithDelegate(artifacts, deployer, FromBlockNumber).then((fromBlockNumber) => {
    return fromBlockNumber.initialize()
  })
}
