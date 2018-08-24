module.exports = async function(env, patientAddress, doctorAddress) {
  let ipfsHash = '0x516d61485a4a774243486a54726d3848793244356d50706a64636d5a4d396e5971554e475a6855435368526e5a4a' // generateBytes(50)
  let encryptedCaseKey = '0x265995a0a13dad6fbc6769d0c9a99f07dcb1acb7bc8c5f8c5a85ab6739512b9bcad881a302630a17dcbdbe908683d13d3f2363a2e006af9df53068c0860f2f73'
  let caseKeySalt =
  '0x365995a0a13dad6fbc6769d0c9a99f07dcb1acb7bc8c5f8c5a85ab6739512b9bcad881a302630a17dcbdbe908683d13d3f2363a2e006af9df53068c0860f2f77'

  let currentCount = await env.caseManager.getPatientCaseListCount(patientAddress)
  currentCount = parseInt(currentCount.toString())
  let caseFeeWei = await env.caseManager.caseFeeWei()
  let halfCaseFeeWei = caseFeeWei.mul(50).div(100).floor()
  let totalCaseFee = caseFeeWei.plus(halfCaseFeeWei)
  await env.caseManager.createAndAssignCase(
    patientAddress,
    encryptedCaseKey,
    caseKeySalt,
    ipfsHash,
    doctorAddress,
    'doctor encrypted case key',
    {
      from: patientAddress,
      value: totalCaseFee
    }
  )
  let nextCount = await env.caseManager.getPatientCaseListCount(patientAddress)
  assert.equal(nextCount, currentCount + 1)
  return await env.caseManager.patientCases(patientAddress, currentCount)
}
