let CaseManager = artifacts.require("./CaseManager.sol");
let Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer) {
  const registryInstance = Registry.deployed()

  CaseManager.at(registryInstance.methods.lookup(web3.sha3('CaseManager'))).then(i => cm = i)
  const caseIndices = cm.caseIndices.call()

  for (var i = 0; i < caseIndices.length; i++){

  }
};
