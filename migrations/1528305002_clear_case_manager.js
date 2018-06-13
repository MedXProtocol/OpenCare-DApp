var deployAndRegisterDelegate = require('./support/deploy-and-register-delegate')

const Registry = artifacts.require('./Registry.sol');
const Delegate = artifacts.require('./Delegate.sol');
const CaseManager = artifacts.require('./CaseManager.sol');
const MedXToken = artifacts.require("./MedXToken.sol");

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
    let registryInstance = await Registry.deployed()
    let medXTokenInstance = await MedXToken.deployed()
    return deployAndRegisterDelegate(deployer, Delegate, Registry, 'CaseManager', 'CaseManagerTarget').then((delegateAddress) => {
      return CaseManager.at(delegateAddress).then(caseManager => {
        return caseManager.initialize(10, medXTokenInstance.address, registryInstance.address)
      })
    })
  })
};
