import { all } from 'redux-saga/effects'
import { addContract, cacheCall, contractByName } from '~/saga-genesis'
import { cacheCallValue } from '~/saga-genesis'

export const populateCases = function(state, caseAddresses) {
  const CaseManager = contractByName(state, 'CaseManager')
  const address = state.sagaGenesis.accounts[0]
  return caseAddresses.reduce((caseList, caseAddress) => {
    let status = cacheCallValue(state, caseAddress, 'status')
    if (status) {
      status = parseInt(status, 10)
    }
    let createdAt = cacheCallValue(state, caseAddress, 'createdAt')
    if (createdAt) {
      createdAt = parseInt(createdAt, 10)
    }
    let updatedAt = cacheCallValue(state, caseAddress, 'updatedAt')
    if (updatedAt) {
      updatedAt = parseInt(updatedAt, 10)
    }

    const diagnosingDoctor = cacheCallValue(state, caseAddress, 'diagnosingDoctor')
    const challengingDoctor = cacheCallValue(state, caseAddress, 'challengingDoctor')

    let objIndex = cacheCallValue(state, CaseManager, 'caseIndices', caseAddress)
    if (objIndex) {
      objIndex = parseInt(objIndex, 10)
    }

    if (status && objIndex && (diagnosingDoctor || challengingDoctor)) {
      const isDiagnosingDoctor = diagnosingDoctor === address
      caseList.push({
        createdAt,
        updatedAt,
        caseAddress,
        status,
        objIndex,
        isDiagnosingDoctor
      })
    }

    return caseList
  }, [])
}

export const populateCasesSaga = function* (CaseManager, caseAddresses) {
  yield all(caseAddresses.map(function* (caseAddress) {
    yield addContract({ address: caseAddress, contractKey: 'Case' })
    yield all([
      cacheCall(caseAddress, 'status'),
      cacheCall(caseAddress, 'createdAt'),
      cacheCall(caseAddress, 'updatedAt'),
      cacheCall(caseAddress, 'diagnosingDoctor'),
      cacheCall(caseAddress, 'challengingDoctor'),
      cacheCall(CaseManager, 'caseIndices', caseAddress)
    ])
  }))
}
