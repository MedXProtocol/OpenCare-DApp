const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
let CaseDiagnosingDoctor = artifacts.require("./CaseDiagnosingDoctor.sol")

module.exports = function(deployer) {
  deployer.then(async () => {
    return deployTargetAndDelegate(artifacts, deployer, CaseDiagnosingDoctor)
  })
};
