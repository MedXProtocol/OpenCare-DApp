var deployAndRegister = require('./deploy-and-register')
var deployAndRegisterDelegate = require('./deploy-and-register-delegate')

module.exports = function(artifacts, deployer, contract) {
  const Delegate = artifacts.require('Delegate.sol')
  const Registry = artifacts.require('Registry.sol')

  const targetKey = contract.contractName + 'Target'
  const delegateKey = contract.contractName

  return deployAndRegister(deployer, contract, Registry, targetKey).then(() => {
    return deployAndRegisterDelegate(deployer, Delegate, Registry, delegateKey, targetKey).then((address) => {
      return contract.at(address)
    })
  })
};
