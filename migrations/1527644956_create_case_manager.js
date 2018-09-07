var deployWithDelegate = require('./support/deployWithDelegate')

const CaseManager = artifacts.require("./CaseManager.sol")
const Registry = artifacts.require('./Registry.sol')

module.exports = function(deployer, network, accounts) {
  deployer.then(async () => {
    let registryInstance = await Registry.deployed()
    return deployWithDelegate(artifacts, deployer, CaseManager).then((caseManager) => {
      let caseFeeUsd = web3.toWei('15', 'ether')
      return caseManager.setBaseCaseFee(caseFeeUsd)
    })
  })
}
