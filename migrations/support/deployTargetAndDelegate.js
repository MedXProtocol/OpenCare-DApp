const deployAndRegister = require('./deployAndRegister')
const deployAndRegisterDelegate = require('./deployAndRegisterDelegate')
const migrationLog = require('./migrationLog')
const tdr = require('truffle-deploy-registry')

/** @title
  * @dev Deploys a new Contract and registers it with the Registry
  * then creates a new Delegate that points to the contract, and is registered
  * under the same name as the contract.
  *
  * Use this to deploy a brand new Contract (*Target, behaviour) and it's
  * corresponding sibling Delegate (memory)
  */
module.exports = function(artifacts, deployer, contract, networkName) {
  const Delegate = artifacts.require('Delegate.sol')
  const Registry = artifacts.require('Registry.sol')

  const targetKey = contract.contractName + 'Target'
  const delegateKey = contract.contractName

  return deployAndRegister(deployer, contract, Registry, targetKey).then(() => {
    return deployAndRegisterDelegate(deployer, Delegate, Registry, delegateKey, targetKey).then(async (delegate) => {
      const address = delegate.address
      if (!networkName) { throw new Error('you must pass the network name') }
      if (!tdr.isDryRunNetworkName(networkName)) {
        await tdr.append(deployer.network_id, {
          contractName: delegateKey,
          address: address,
          transactionHash: delegate.transactionHash
        })
      }
      migrationLog(delegateKey, targetKey, address)
      return contract.at(address)
    })
  })
};
