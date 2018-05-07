var deployAndRegister = require('./support/deploy-and-register')
var deployAndRegisterDelegate = require('./support/deploy-and-register-delegate')

let MedXToken = artifacts.require("./MedXToken.sol");
let CaseFactory = artifacts.require("./CaseFactory.sol");
let Registry = artifacts.require('./Registry.sol');
let Delegate = artifacts.require('./Delegate.sol');

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
    let registryInstance = await Registry.deployed()
    let medXTokenInstance = await MedXToken.deployed()
    let caseFactoryTargetKey = 'CaseFactoryTarget'
    await deployAndRegister(deployer, CaseFactory, Registry, caseFactoryTargetKey).then(async () => {
      await deployAndRegisterDelegate(deployer, Delegate, Registry, 'CaseFactory', caseFactoryTargetKey)
    })
    let caseFactoryDelegate = await CaseFactory.at(Delegate.address)
    await caseFactoryDelegate.initialize(10, medXTokenInstance.address, registryInstance.address)
  })
};
