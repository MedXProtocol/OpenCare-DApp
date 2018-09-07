const deployWithDelegate = require('./support/deployWithDelegate')

let CasePaymentManager = artifacts.require("./CasePaymentManager.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()
    return deployWithDelegate(artifacts, deployer, CasePaymentManager).then((caseDiagnosingDoctor) => {
      return caseDiagnosingDoctor.initialize(registryInstance.address)
    })
  })
};
