let CaseManager = artifacts.require("./CaseManager.sol");
let CaseStatusManager = artifacts.require("./CaseStatusManager.sol");
let Registry = artifacts.require('./Registry.sol');
let Case = artifacts.require('./Case.sol');

async function migrateCase(cm, cms, index) {
  const caseAddress = await cm.caseList(index)
  const kase = await Case.at(caseAddress)
  const diagnosingDoctor = await kase.diagnosingDoctor()
  const challengingDoctor = await kase.challengingDoctor()
  const status = await kase.status()
  if (status == '4' || status == '7' || status == '8') {
    await cms.addClosedCase(diagnosingDoctor, caseAddress)
    if (challengingDoctor) {
      await cms.addClosedCase(challengingDoctor, caseAddress)
    }
  } else {
    await cms.addOpenCase(diagnosingDoctor, caseAddress)
    if (challengingDoctor) {
      await cms.addOpenCase(challengingDoctor, caseAddress)
    }
  }
}

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()
    const CaseManagerAddress = await registryInstance.lookup(web3.sha3('CaseManager'))
    const CaseStatusManagerAddress = await registryInstance.lookup(web3.sha3('CaseStatusManager'))
    const cm = await CaseManager.at(CaseManagerAddress)
    const cms = await CaseStatusManager.at(CaseStatusManagerAddress)
    const caseCount = await cm.getAllCaseListCount()
    for (var i = 1; i <= caseCount; i++) {
      try {
        await migrateCase(cm, cms, i)
        console.log('Migrated case ', i)
      } catch (error) {
        console.warn('Case already migrated: ', i, error)
      }
    }
  })
};
