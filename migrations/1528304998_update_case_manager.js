var deploy = require('./support/deploy')

const SkipList = artifacts.require('./SkipList.sol');
const MedXToken = artifacts.require("./MedXToken.sol");
const CaseManager = artifacts.require("./CaseManager.sol");
const Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
    let skipListInstance = await SkipList.deployed()
    let registryInstance = await Registry.deployed()
    let medXTokenInstance = await MedXToken.deployed()
    deployer.link(SkipList, CaseManager)
    return deploy(artifacts, deployer, CaseManager).then((caseManager) => {
      return caseManager.initialize(10, medXTokenInstance.address, registryInstance.address)
    })
  })
};
