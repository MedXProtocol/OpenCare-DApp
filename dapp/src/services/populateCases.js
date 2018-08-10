import { all } from 'redux-saga/effects'
import { addContract, cacheCall, contractByName } from '~/saga-genesis'
import { cacheCallValue } from '~/saga-genesis'
import rangeRight from 'lodash.rangeright'

export const populateCases = function(state, caseAddresses) {
  const CaseManager = contractByName(state, 'CaseManager')
  const address = state.sagaGenesis.accounts[0]
  return caseAddresses.reduce((caseList, caseAddress) => {
    const status = cacheCallValue(state, caseAddress, 'status')
    const createdAt = cacheCallValue(state, caseAddress, 'createdAt')
    const diagnosingDoctor = cacheCallValue(state, caseAddress, 'diagnosingDoctor')
    const challengingDoctor = cacheCallValue(state, caseAddress, 'challengingDoctor')
    const objIndex = cacheCallValue(state, CaseManager, 'caseIndices', caseAddress)

    if (status && (diagnosingDoctor || challengingDoctor)) {
      const isDiagnosingDoctor = diagnosingDoctor === address
      caseList.push({
        createdAt,
        caseAddress,
        status,
        objIndex,
        isDiagnosingDoctor
      })
    }

    return caseList
  }, [])
}

export const populateCasesSaga = function* (CaseManager, caseAddresses, caseCount) {
  yield all(caseAddresses.map(function* (caseAddress) {
    yield addContract({ address: caseAddress, contractKey: 'Case' })
    yield all([
      cacheCall(caseAddress, 'status'),
      cacheCall(caseAddress, 'createdAt'),
      cacheCall(caseAddress, 'diagnosingDoctor'),
      cacheCall(CaseManager, 'caseIndices', caseAddress)
    ])
  }))
}
