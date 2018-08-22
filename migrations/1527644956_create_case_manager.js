var deployWithDelegate = require('./support/deployWithDelegate')

const CaseManager = artifacts.require("./CaseManager.sol")
const Registry = artifacts.require('./Registry.sol')

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
    let registryInstance = await Registry.deployed()
    return deployWithDelegate(artifacts, deployer, CaseManager).then((caseManager) => {
      let caseFee = web3.toWei('10', 'ether')
      return caseManager.initialize(caseFee, registryInstance.address)
    })
  })
}
