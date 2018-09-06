var deployAndRegister = require('./deployAndRegister')
var deployAndRegisterDelegate = require('./deployAndRegisterDelegate')
var migrationLog = require('./migrationLog')

/** @title deployWithDelegate
  * @dev Deploys a new Contract and registers it with the Registry then creates a new Delegate
  * that points to the contract, and is registered under the same name as the contract.
  */
module.exports = function(artifacts, deployer, contract) {
  const Delegate = artifacts.require('Delegate.sol')
  const Registry = artifacts.require('Registry.sol')

  const targetKey = contract.contractName + 'Target'
  const delegateKey = contract.contractName

  return deployAndRegister(deployer, contract, Registry, targetKey).then(() => {
    return deployAndRegisterDelegate(deployer, Delegate, Registry, delegateKey, targetKey).then((address) => {
      migrationLog(delegateKey, targetKey, address)

      return contract.at(address)
    })
  })
};
