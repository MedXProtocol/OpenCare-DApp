import {
  cacheCall,
  cacheCallValue
} from 'saga-genesis'
import { fixAddress } from '~/utils/fixAddress'

export const mapOpenCaseAddresses = function(state, CaseStatusManager, address) {
  const openAddresses = []

  let currentNodeId = cacheCallValue(state, CaseStatusManager, 'firstOpenCaseId', address)
  while (currentNodeId && currentNodeId !== '0') {
    const openCaseAddress = fixAddress(cacheCallValue(state, CaseStatusManager, 'openCaseAddress', address, currentNodeId))
    openAddresses.push(openCaseAddress)

    currentNodeId = cacheCallValue(state, CaseStatusManager, 'nextOpenCaseId', address, currentNodeId)
  }

  return openAddresses
}

export const openCaseAddressesSaga = function* (CaseStatusManager, address) {
  const openAddresses = []

  let currentNodeId = yield cacheCall(CaseStatusManager, 'firstOpenCaseId', address)
  while (currentNodeId && currentNodeId !== '0') {
    const caseAddress = yield cacheCall(CaseStatusManager, 'openCaseAddress', address, currentNodeId)
    yield openAddresses.push(fixAddress(caseAddress))

    currentNodeId = yield cacheCall(CaseStatusManager, 'nextOpenCaseId', address, currentNodeId)
  }

  return openAddresses
}

export const mapOpenCasePage = function (state, CaseStatusManager, doctorAddress, pageSize, currentNodeId) {
  const nodes = []

  if (!currentNodeId) {
    currentNodeId = cacheCallValue(state, CaseStatusManager, 'firstOpenCaseId', doctorAddress)
  }
  let count = 0
  while (currentNodeId && currentNodeId !== '0' && count < pageSize) {
    const openCaseAddress = fixAddress(cacheCallValue(state, CaseStatusManager, 'openCaseAddress', doctorAddress, currentNodeId))
    const nextOpenCaseId = cacheCallValue(state, CaseStatusManager, 'nextOpenCaseId', doctorAddress, currentNodeId)
    var node = {
      id: currentNodeId,
      caseAddress: openCaseAddress,
      nextId: nextOpenCaseId
    }
    nodes.push(node)
    currentNodeId = nextOpenCaseId
    count++
  }

  return nodes
}

export const openCasePageSaga = function* (CaseStatusManager, doctorAddress, pageSize, currentNodeId) {
  const nodes = []

  if (!currentNodeId) {
    currentNodeId = yield cacheCall(CaseStatusManager, 'firstOpenCaseId', doctorAddress)
  }
  let count = 0
  while (currentNodeId && currentNodeId !== '0' && count < pageSize) {
    const openCaseAddress = yield cacheCall(CaseStatusManager, 'openCaseAddress', doctorAddress, currentNodeId)
    const nextOpenCaseId = yield cacheCall(CaseStatusManager, 'nextOpenCaseId', doctorAddress, currentNodeId)
    var node = {
      id: currentNodeId,
      caseAddress: openCaseAddress,
      nextId: nextOpenCaseId
    }
    nodes.push(node)
    currentNodeId = nextOpenCaseId
    count++
  }

  return nodes
}
