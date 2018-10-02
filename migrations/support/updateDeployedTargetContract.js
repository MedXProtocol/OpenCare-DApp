const deployAndRegister = require('./deployAndRegister')

/**
  * @title updateDeployedTargetContract
  * @dev Updates a pre-existing Target (behavioural) Contract and registers
  * it with the Registry. Use this to update a pre-existing contract
  */
module.exports = function (deployer, artifacts, contractName) {
  const contract = artifacts.require("./" + contractName + ".sol")
  const Registry = artifacts.require('./Registry.sol')

  return deployAndRegister(deployer, contract, Registry, contractName + 'Target')
}
