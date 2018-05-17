import { call, put, takeEvery, takeLatest, select } from 'redux-saga/effects'
import get from 'lodash.get'

// basically need a promise that is aware of the DrizzleContract cache
// listens for actions that

export function* cacheCall(drizzleContract, field, ...args) {
  // let cacheKey = drizzleContract.methods[field].cacheCall(...args)
  // let hasValue = false
  // let contractSync = yield select(get, `contracts[${drizzleContract.contractName}].synced`)
  // let field = yield select(get, `contracts[${drizzleContract.contractName}][${field}][${cacheKey}]`)
  // if (contractSync && field) {
  //   return field.value
  // }
}

export function* approveDiagnosisRequest({drizzle, contract}) {
  let diagnosingDoctorA = yield cacheCall(cacheCall, contract, 'diagnosingDoctorA')
  console.log(diagnosingDoctorA)
  debugger
  // get doctor address

  // yield call(getContractVar, contract, 'Blarg')
}

function* approveChallengeRequest({drizzle, contract}) {

}
