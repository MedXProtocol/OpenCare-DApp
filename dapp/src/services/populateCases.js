import { all } from 'redux-saga/effects'
import { addContract, cacheCall } from '~/saga-genesis/sagas'
import { cacheCallValue } from '~/saga-genesis'

export const populateCases = function(state, CaseManager, address, caseCount) {
  const cases = []

  for (let objIndex = (caseCount - 1); objIndex >= 0; --objIndex) {
    let caseAddress = cacheCallValue(state, CaseManager, 'doctorCaseAtIndex', address, objIndex)
    if (caseAddress) {
      const status = cacheCallValue(state, caseAddress, 'status')
      const diagnosingDoctor = cacheCallValue(state, caseAddress, 'diagnosingDoctor')
      const challengingDoctor = cacheCallValue(state, caseAddress, 'challengingDoctor')
      if (status && (diagnosingDoctor || challengingDoctor)) {
        const isDiagnosingDoctor = diagnosingDoctor === address
        cases.push({
          caseAddress,
          status,
          objIndex,
          isDiagnosingDoctor
        })
      }
    }
  }

  return cases
}

export const populateCasesSaga = function*(CaseManager, address, caseCount) {
  for (let caseIndex = (caseCount - 1); caseIndex >= 0; --caseIndex) {
    let caseAddress = yield cacheCall(CaseManager, 'doctorCaseAtIndex', address, caseIndex)
    yield addContract({ address: caseAddress, contractKey: 'Case' })
    yield all([
      cacheCall(caseAddress, 'status'),
      cacheCall(caseAddress, 'diagnosingDoctor')
    ])
  }
}
