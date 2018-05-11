const buildCaseParameters = require('./build-case-parameters')

module.exports = async function(env, address, hexData = buildCaseParameters()) {
  let currentCount = await env.caseManager.getPatientCaseListCount(address)
  currentCount = parseInt(currentCount.toString())
  await env.medXToken.approveAndCall(env.caseManager.address, 15, hexData, { from: address })
  return await env.caseManager.patientCases(address, currentCount)
}
