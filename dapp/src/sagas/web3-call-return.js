import { put, getContext, takeEvery } from 'redux-saga/effects'

function* invalidateCache ({call, receipt}) {
  const contractRegistry = yield getContext('contractRegistry')
  const MedXToken = contractRegistry.requireAddressByName('MedXToken')
  const CaseManager = contractRegistry.requireAddressByName('CaseManager')
  if (call.address === MedXToken) {
    yield put({type: 'CACHE_INVALIDATE_ADDRESS', address: CaseManager})
  }
}

export default function* () {
  yield takeEvery('WEB3_SEND_RETURN', invalidateCache)
}
