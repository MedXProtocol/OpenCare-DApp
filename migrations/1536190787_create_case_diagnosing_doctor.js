const deployTargetAndDelegate = require('./support/deployTargetAndDelegate')
const CaseDiagnosingDoctor = artifacts.require("./CaseDiagnosingDoctor.sol");

module.exports = function(deployer, networkName) {
  return deployTargetAndDelegate(artifacts, deployer, CaseDiagnosingDoctor, networkName)
};
