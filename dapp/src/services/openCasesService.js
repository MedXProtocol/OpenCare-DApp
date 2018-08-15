import { cacheCall } from '~/saga-genesis/sagas'
import { cacheCallValue } from '~/saga-genesis/state-finders'
import { isBlank } from '~/utils/isBlank'

export const mapOpenCaseAddresses = function(state, CaseStatusManager, address) {
  const openAddresses = []

  let currentNodeId = cacheCallValue(state, CaseStatusManager, 'firstOpenCaseId', address)
  while (currentNodeId && currentNodeId !== '0') {
    const openCaseAddress = cacheCallValue(state, CaseStatusManager, 'openCaseAddress', address, currentNodeId)
    if (openCaseAddress && !isBlank(openCaseAddress)) {
      openAddresses.push(openCaseAddress)
    }
    currentNodeId = cacheCallValue(state, CaseStatusManager, 'nextOpenCaseId', address, currentNodeId)
  }

  return openAddresses
}

export const openCaseAddressesSaga = function* (CaseStatusManager, address) {
  let openAddresses = []

  let currentNodeId = yield cacheCall(CaseStatusManager, 'firstOpenCaseId', address)
  while (currentNodeId && currentNodeId !== '0') {
    const caseAddress = yield cacheCall(CaseStatusManager, 'openCaseAddress', address, currentNodeId)
    if (caseAddress) {
      yield openAddresses.push(caseAddress)
    }

    currentNodeId = yield cacheCall(CaseStatusManager, 'nextOpenCaseId', address, currentNodeId)
  }
}
