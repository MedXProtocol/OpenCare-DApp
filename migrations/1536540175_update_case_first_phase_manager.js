const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
let CaseFirstPhaseManager = artifacts.require("./CaseFirstPhaseManager.sol")

module.exports = function(deployer) {
  deployer.then(async () => {
    return deployTargetAndDelegate(artifacts, deployer, CaseFirstPhaseManager)
  })
};
