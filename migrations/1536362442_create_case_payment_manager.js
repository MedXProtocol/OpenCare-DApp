const deployWithDelegate = require('./support/deployWithDelegate')
const CasePaymentManager = artifacts.require("./CasePaymentManager.sol")

module.exports = function(deployer) {
  deployWithDelegate(artifacts, deployer, CasePaymentManager).then((casePaymentManager) => {
    const caseFeeUsd = web3.toWei('10', 'ether')
    return casePaymentManager.setBaseCaseFeeUsdWei(caseFeeUsd)
  })
};

//1536362442
