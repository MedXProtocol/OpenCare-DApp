var deployWithDelegate = require('./support/deployWithDelegate')

const SkipList = artifacts.require('./SkipList.sol');
const MedXToken = artifacts.require("./MedXToken.sol");
const CaseManager = artifacts.require("./CaseManager.sol");
const Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer, network, accounts) {
  deployer.deploy(SkipList).then(async () => {
    deployer.link(SkipList, CaseManager)
    let registryInstance = await Registry.deployed()
    let medXTokenInstance = await MedXToken.deployed()
    return deployWithDelegate(artifacts, deployer, CaseManager).then((caseManager) => {
      return caseManager.initialize(10, medXTokenInstance.address, registryInstance.address)
    })
  })
};
