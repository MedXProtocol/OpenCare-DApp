const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')

const CaseManager = artifacts.require("./CaseManager.sol")
const Registry = artifacts.require('./Registry.sol')

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
    let registryInstance = await Registry.deployed()
    return deployTargetAndDelegate(artifacts, deployer, CaseManager).then((caseManager) => {
      let caseFeeUsd = web3.toWei('10', 'ether')
      return caseManager.setBaseCaseFee(caseFeeUsd)
    })
  })
}
