const buildCaseParameters = require('./build-case-parameters')

module.exports = async function(env, address, hexData = buildCaseParameters()) {
  let currentCount = await env.caseFactory.getPatientCaseListCount(address)
  currentCount = parseInt(currentCount.toString())
  await env.medXToken.approveAndCall(env.caseFactory.address, 15, hexData, { from: address })
  return await env.caseFactory.patientCases(address, currentCount)
}
