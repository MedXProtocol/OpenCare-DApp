const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
const CasePaymentManager = artifacts.require("./CasePaymentManager.sol")

module.exports = function(deployer) {
  deployTargetAndDelegate(artifacts, deployer, CasePaymentManager).then((casePaymentManager) => {
    const caseFeeUsd = web3.toWei('10', 'ether')
    return casePaymentManager.setBaseCaseFeeUsdWei(caseFeeUsd)
  })
};

//1536362442
