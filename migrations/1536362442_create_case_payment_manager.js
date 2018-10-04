const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
const CasePaymentManager = artifacts.require("./CasePaymentManager.sol")

module.exports = function(deployer, networkName) {
  deployTargetAndDelegate(artifacts, deployer, CasePaymentManager, networkName).then((casePaymentManager) => {
    const caseFeeUsd = web3.toWei('10', 'ether')
    return casePaymentManager.setBaseCaseFeeUsdWei(caseFeeUsd)
  })
};
