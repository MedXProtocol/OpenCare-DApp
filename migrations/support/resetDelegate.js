const deployAndRegisterDelegate = require('./deployAndRegisterDelegate')
const migrationLog = require('./migrationLog')

/**
  * @title updateDeployedTargetContract
  * @dev Updates a pre-existing Target (behavioural) Contract and registers
  * it with the Registry. Use this to update a pre-existing contract
  */
module.exports = function (deployer, artifacts, contractName) {
  const targetKey = contractName + 'Target'
  const delegateKey = contractName
  const Delegate = artifacts.require('Delegate.sol')
  const Registry = artifacts.require('Registry.sol')

  deployAndRegisterDelegate(deployer, Delegate, Registry, delegateKey, targetKey).then(address => {
    migrationLog(delegateKey, targetKey, address)
  })
}
