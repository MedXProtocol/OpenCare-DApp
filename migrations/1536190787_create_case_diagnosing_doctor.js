const deployWithDelegate = require('./support/deployWithDelegate')

let CaseDiagnosingDoctor = artifacts.require("./CaseDiagnosingDoctor.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()

    return deployWithDelegate(artifacts, deployer, CaseDiagnosingDoctor).then((caseDiagnosingDoctor) => {
    })
  })
};
