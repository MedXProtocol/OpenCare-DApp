const deployWithDelegate = require('./support/deployWithDelegate')
let CaseLifecycleManager = artifacts.require("./CaseLifecycleManager.sol")

module.exports = function(deployer) {
  deployer.then(async () => {
    return deployWithDelegate(artifacts, deployer, CaseLifecycleManager)
  })
};
