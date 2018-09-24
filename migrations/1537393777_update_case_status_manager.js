const resetDelegate = require('./support/resetDelegate')

module.exports = function(deployer) {
  resetDelegate(deployer, artifacts, 'CaseStatusManager')
};
