import { all } from 'redux-saga/effects'
import { addContract, cacheCall } from '~/saga-genesis/sagas'
import { cacheCallValue } from '~/saga-genesis'
import rangeRight from 'lodash.rangeright'

export const populateCases = function(state, CaseManager, address, caseCount) {
  const cases = []
  const indices = rangeRight(caseCount)

  indices.forEach(function (objIndex) {
    let caseAddress = cacheCallValue(state, CaseManager, 'doctorCaseAtIndex', address, objIndex)
    if (caseAddress) {
      const status = cacheCallValue(state, caseAddress, 'status')
      const createdAt = cacheCallValue(state, caseAddress, 'createdAt')
      const diagnosingDoctor = cacheCallValue(state, caseAddress, 'diagnosingDoctor')
      const challengingDoctor = cacheCallValue(state, caseAddress, 'challengingDoctor')

      if (status && (diagnosingDoctor || challengingDoctor)) {
        const isDiagnosingDoctor = diagnosingDoctor === address
        cases.push({
          createdAt,
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

export const populateCasesSaga = function*(CaseManager, address, caseCount) {
  if (!address || !CaseManager || !caseCount) { return }

  const indices = rangeRight(caseCount)

  yield all(indices.map(function* (objIndex) {
    const caseAddress = yield cacheCall(CaseManager, 'doctorCaseAtIndex', address, objIndex)

    yield addContract({ address: caseAddress, contractKey: 'Case' })
    yield all([
      cacheCall(caseAddress, 'status'),
      cacheCall(caseAddress, 'createdAt'),
      cacheCall(caseAddress, 'diagnosingDoctor')
    ])
  }))
}
