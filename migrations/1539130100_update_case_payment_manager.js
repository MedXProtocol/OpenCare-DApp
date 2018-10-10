const updateDeployedTargetContract = require('./support/updateDeployedTargetContract')

module.exports = function(deployer, network, accounts) {
  updateDeployedTargetContract(deployer, artifacts, 'CasePaymentManager')
}
