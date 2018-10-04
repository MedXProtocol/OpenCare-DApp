const deployAndRegisterDelegate = require('./deployAndRegisterDelegate')
const migrationLog = require('./migrationLog')
const tdr = require('truffle-deploy-registry')

/**
  * @title updateDeployedTargetContract
  * @dev Updates a pre-existing Target (behavioural) Contract and registers
  * it with the Registry. Use this to update a pre-existing contract
  */
module.exports = function (deployer, artifacts, contractName, networkName) {
  const targetKey = contractName + 'Target'
  const delegateKey = contractName
  const Delegate = artifacts.require('Delegate.sol')
  const Registry = artifacts.require('Registry.sol')

  deployAndRegisterDelegate(deployer, Delegate, Registry, delegateKey, targetKey).then(delegate => {
    if (!networkName) { throw new Error('you must pass the network name') }
    if (!tdr.isDryRunNetworkName(networkName)) {
      await tdr.append(deployer.network_id, {
        contractName: delegateKey,
        address: delegate.address,
        transactionHash: delegate.transactionHash
      })
    })
    migrationLog(delegateKey, targetKey, delegate.address)
  })
}
