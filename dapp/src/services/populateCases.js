import { all } from 'redux-saga/effects'
import { addContract, cacheCall } from '~/saga-genesis/sagas'
import { cacheCallValue } from '~/saga-genesis'
import rangeRight from 'lodash.rangeright'

const MAX_CASES_PER_PAGE = 5

export const populateCases = function(state, CaseManager, address, caseCount, caseCountMax) {
  const cases = []

  const max = caseCountMax || MAX_CASES_PER_PAGE
  const indices = rangeRight(caseCount - Math.max(max), caseCount)

  indices.forEach(function (objIndex) {
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
  })

  return cases
}

export const populateCasesSaga = function*(CaseManager, address, caseCount, caseCountMax) {
  if (!address || !CaseManager) { return }

  const max = caseCountMax || MAX_CASES_PER_PAGE

  const indices = rangeRight(caseCount - Math.max(max), caseCount)

  yield all(indices.map(function* (objIndex) {
    const caseAddress = yield cacheCall(CaseManager, 'doctorCaseAtIndex', address, objIndex)

    yield addContract({ address: caseAddress, contractKey: 'Case' })
    yield all([
      cacheCall(caseAddress, 'status'),
      cacheCall(caseAddress, 'diagnosingDoctor')
    ])
  }))
}
