const updateDeployedTargetContract = require('./support/updateDeployedTargetContract')

module.exports = function(deployer) {
  updateDeployedTargetContract(deployer, artifacts, 'CaseDiagnosingDoctor')
}
