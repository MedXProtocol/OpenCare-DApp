var deployAndRegister = require('./support/deploy-and-register')
var deployAndRegisterDelegate = require('./support/deploy-and-register-delegate')

let DoctorManager = artifacts.require("./DoctorManager.sol");
let Registry = artifacts.require('./Registry.sol');
let Delegate = artifacts.require('./Delegate.sol');

module.exports = function(deployer) {
  deployAndRegister(deployer, DoctorManager, Registry, 'DoctorManagerTarget')
  deployAndRegisterDelegate(deployer, Delegate, Registry, 'DoctorManager', 'DoctorManagerTarget').then(async () => {
    let doctorManagerDelegate = await DoctorManager.at(Delegate.address)
    await doctorManagerDelegate.initialize()
  })
};
