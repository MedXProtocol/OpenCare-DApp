let CaseManager = artifacts.require("./CaseManager.sol");
let Registry = artifacts.require('./Registry.sol');
let Case = artifacts.require('./Case.sol');

async function migrateCase(cm, index) {
  const caseAddress = await cm.caseList(index)
  const kase = await Case.at(caseAddress)
  const diagnosingDoctor = await kase.diagnosingDoctor()
  const challengingDoctor = await kase.challengingDoctor()
  const status = await kase.status()
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

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()
    const CaseManagerAddress = await registryInstance.lookup(web3.sha3('CaseManager'))
    const cm = await CaseManager.at(CaseManagerAddress)
    const caseCount = await cm.getAllCaseListCount()
    for (var i = 1; i <= caseCount; i++) {
      try {
        await migrateCase(cm, i)
        console.log('Migrated case ', i)
      } catch (error) {
        console.warn('Case already migrated: ', i, error)
      }
    }
  })
};
