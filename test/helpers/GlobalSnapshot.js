// let caseInstance
let env

// const createEnvironment = require('./create-environment')
const evmSnapshot = require('./evmSnapshot')
const evmRevert = require('./evmRevert')

let snapshotId

// before(async () => {
//   console.log('GLOBAL SNAPSHOT BEFORE', artifacts)
//   env = await createEnvironment(artifacts)
//
//   // await env.doctorManager.addOrReactivateDoctor(patient, 'Patient is a Doc', 'CA', 'AB')
//   // await env.doctorManager.addOrReactivateDoctor(doctor, 'Doogie', 'US', 'CO')
//   // await env.doctorManager.addOrReactivateDoctor(doctor2, 'Dr. Hibbert', 'US', 'CO')
//
//   // caseFeeWei = await env.caseManager.caseFeeWei()
//
//   // caseInstance = await Case.at(await createCase(env, patient, doctor))
//
//   console.log('RUNNING BEFORE / SNAPSHOT')
//   // snapshotId = await evmSnapshot()
//   console.log('snapshotId IS', snapshotId)
// })

afterEach(async () => {
  // console.log('GLOBAL REVERT')
  // await evmRevert(snapshotId)
  // console.log('second time')
  await evmRevert()
  await evmSnapshot()
})

module.exports = function() {
  return env
}
