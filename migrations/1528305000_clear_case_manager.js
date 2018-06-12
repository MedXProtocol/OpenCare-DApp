var deployAndRegisterDelegate = require('./support/deploy-and-register-delegate')

const Registry = artifacts.require('./Registry.sol');
const Delegate = artifacts.require('./Delegate.sol');

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
    return deployAndRegisterDelegate(deployer, Delegate, Registry, 'CaseManager', 'CaseManagerTarget')
  })
};
