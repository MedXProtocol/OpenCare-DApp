module.exports = async function(env, address) {
  let ipfsHash = '0x516d61485a4a774243486a54726d3848793244356d50706a64636d5a4d396e5971554e475a6855435368526e5a4a' // generateBytes(50)
  let encryptedCaseKey = '0x265995a0a13dad6fbc6769d0c9a99f07dcb1acb7bc8c5f8c5a85ab6739512b9bcad881a302630a17dcbdbe908683d13d3f2363a2e006af9df53068c0860f2f73'
  let caseKeySalt =
  '0x365995a0a13dad6fbc6769d0c9a99f07dcb1acb7bc8c5f8c5a85ab6739512b9bcad881a302630a17dcbdbe908683d13d3f2363a2e006af9df53068c0860f2f77'
  var hexData = env.caseManager.contract.createCase.getData(address, encryptedCaseKey, caseKeySalt, ipfsHash)
  let currentCount = await env.caseManager.getPatientCaseListCount(address)
  currentCount = parseInt(currentCount.toString())
  await env.medXToken.approveAndCall(env.caseManager.address, 15, hexData, { from: address })
  return await env.caseManager.patientCases(address, currentCount)
}
