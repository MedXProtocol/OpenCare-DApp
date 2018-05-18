const deployAndRegisterDelegate = require('./support/deploy-and-register-delegate')

let MedXToken = artifacts.require('./MedXToken.sol')
let Registry = artifacts.require('./Registry.sol')
let Delegate = artifacts.require('./Delegate.sol')
let CaseManager = artifacts.require('./CaseManager.sol')

module.exports = function(deployer) {
  deployer.then(async () => {
    let registryInstance = await Registry.deployed()
    let medXTokenInstance = await MedXToken.deployed()
    return deployAndRegisterDelegate(deployer, Delegate, Registry, 'CaseManager', 'CaseManagerTarget').then((address) => {
      return CaseManager.at(address).then((instance) => instance.initialize(10, medXTokenInstance.address, registryInstance.address))
    })
  })
};
