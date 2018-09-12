const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
let CaseLifecycleManager = artifacts.require("./CaseLifecycleManager.sol")

module.exports = function(deployer) {
  deployer.then(async () => {
    return deployTargetAndDelegate(artifacts, deployer, CaseLifecycleManager)
  })
};
