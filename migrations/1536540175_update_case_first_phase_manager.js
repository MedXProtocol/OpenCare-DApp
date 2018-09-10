const deployWithDelegate = require('./support/deployWithDelegate')
let CaseFirstPhaseManager = artifacts.require("./CaseFirstPhaseManager.sol")

module.exports = function(deployer) {
  deployer.then(async () => {
    return deployWithDelegate(artifacts, deployer, CaseFirstPhaseManager)
  })
};
