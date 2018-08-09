import { all } from 'redux-saga/effects'
import { addContract, cacheCall } from '~/saga-genesis/sagas'
import { cacheCallValue } from '~/saga-genesis'
import rangeRight from 'lodash.rangeright'

export const populateCases = function(state, CaseManager, address, caseCount) {
  let cases = []

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

    //   const caseIndex = cases.findIndex(c => c.caseAddress === caseAddress)

    //   if (caseIndex === -1) {
    //     const status = cacheCallValue(state, caseAddress, 'status')
    //     const createdAt = cacheCallValue(state, caseAddress, 'createdAt')
    //     const diagnosingDoctor = cacheCallValue(state, caseAddress, 'diagnosingDoctor')
    //     const challengingDoctor = cacheCallValue(state, caseAddress, 'challengingDoctor')

    //     /// The current pattern may skip adding createdAt completely if it hasn't been pulled from bc yet
    //     if (status && (diagnosingDoctor || challengingDoctor)) {
    //       console.log('adding caseAddress', caseAddress)

    //       const isDiagnosingDoctor = diagnosingDoctor === address
    //       cases.push({
    //         createdAt,
    //         caseAddress,
    //         status,
    //         objIndex,
    //         isDiagnosingDoctor
    //       })
    //     }
    //   }
    // }
    // })

    // return cases
}

export const populateCasesSaga = function*(CaseManager, address, caseCount) {
  if (!address || !CaseManager) { return }

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
