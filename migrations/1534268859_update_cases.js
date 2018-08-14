const CaseManager = artifacts.require("./CaseManager.sol");
const CaseStatusManager = artifacts.require("./CaseStatusManager.sol");
const Registry = artifacts.require('./Registry.sol');
const Case = artifacts.require('./Case.sol');
const promisify = require('../test/helpers/promisify').promisify

async function migrateCase(cms, caseAddress) {
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

async function isCaseMigrated(cms, caseAddress) {


}

async function getMigratedCases(cms) {
  var cases = promisify(cb => {
    const events = web3.eth.filter({
      address: cms.address,
      fromBlock: 0,
      toBlock: 'latest'
    })
    events.get(cb)
  })
  var logs = await cases
  var caseAddresses = new Set()
  logs.forEach(log => {
    caseAddresses.add('0x' + log.topics[2].substring(26).toLowerCase())
  })
  return caseAddresses
}

module.exports = function(deployer) {
  deployer.then(async () => {
    const registryInstance = await Registry.deployed()
    const CaseManagerAddress = await registryInstance.lookup(web3.sha3('CaseManager'))
    const CaseStatusManagerAddress = await registryInstance.lookup(web3.sha3('CaseStatusManager'))
    const cm = await CaseManager.at(CaseManagerAddress)
    const cms = await CaseStatusManager.at(CaseStatusManagerAddress)
    const caseCount = await cm.getAllCaseListCount()
    const caseAddresses = await getMigratedCases(cms)
    for (var i = 1; i <= caseCount; i++) {
      const caseAddress = await cm.caseList(i)
      if (!caseAddresses.has(caseAddress.toLowerCase())) {
        try {
          await migrateCase(cms, caseAddress)
          console.log('Migrated case ', i, caseAddress)
        } catch (error) {
          console.error('Could not migrate case ', caseAddress, i, error)
        }
      } else {
        console.log('Case already migrated: ', i, caseAddress)
      }
    }
  })
};
