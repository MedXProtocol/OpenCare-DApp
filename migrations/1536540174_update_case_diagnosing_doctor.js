const deployWithDelegate = require('./support/deployWithDelegate')
let CaseDiagnosingDoctor = artifacts.require("./CaseDiagnosingDoctor.sol")

module.exports = function(deployer) {
  deployer.then(async () => {
    return deployWithDelegate(artifacts, deployer, CaseDiagnosingDoctor)
  })
};
