let CaseManager = artifacts.require("./CaseManager.sol");
let Registry = artifacts.require('./Registry.sol');
let Case = artifacts.require('./Case.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()
    const CaseManagerAddress = await registryInstance.lookup(web3.sha3('CaseManager'))
    const cm = await CaseManager.at(CaseManagerAddress)
    const caseCount = await cm.getAllCaseListCount()

    for (var i = 1; i <= caseCount; i++) {
      const caseAddress = await cm.caseList(i)
      const case = await Case.at(caseAddress)
      const diagnosingDoctor = await case.diagnosingDoctor()
      const challengingDoctor = await case.challengingDoctor()
      const status = await case.status()
      if (status == '4' || status == '7' || status == '8') {
        await cm.addClosedCase(diagnosingDoctor, caseAddress)
        if (challengingDoctor) {
          await cm.addClosedCase(challengingDoctor, caseAddress)
        }
      } else {
        await cm.addOpenCase(diagnosingDoctor, caseAddress)
        if (challengingDoctor) {
          await cm.addOpenCase(challengingDoctor, caseAddress)
        }
      }
    }
  })
};
