const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')

let AccountManager = artifacts.require("./AccountManager.sol")
let Registry = artifacts.require('./Registry.sol')

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()
    return deployTargetAndDelegate(artifacts, deployer, AccountManager)
  })
};
