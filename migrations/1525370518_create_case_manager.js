var deploy = require('./support/deploy')

let MedXToken = artifacts.require("./MedXToken.sol");
let CaseManager = artifacts.require("./CaseManager.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
    let registryInstance = await Registry.deployed()
    let medXTokenInstance = await MedXToken.deployed()
    return deploy(artifacts, deployer, CaseManager).then((caseManager) => {
      return caseManager.initialize(10, medXTokenInstance.address, registryInstance.address)
    })
  })
};
