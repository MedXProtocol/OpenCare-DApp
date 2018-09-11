const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')

let CaseDiagnosingDoctor = artifacts.require("./CaseDiagnosingDoctor.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()

    return deployTargetAndDelegate(artifacts, deployer, CaseDiagnosingDoctor).then((caseDiagnosingDoctor) => {
    })
  })
};
