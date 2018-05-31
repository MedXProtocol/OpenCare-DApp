import { put, getContext, takeEvery, select } from 'redux-saga/effects'
import { contractByName } from '@/saga-genesis/state-finders'

function* invalidateCache ({call, receipt}) {
  const contractRegistry = yield getContext('contractRegistry')
  const MedXToken = yield select(contractByName, 'MedXToken')
  const CaseManager = yield select(contractByName, 'CaseManager')
  if (call.address === MedXToken) {
    yield put({type: 'CACHE_INVALIDATE_ADDRESS', address: CaseManager})
  }
}

export default function* () {
  yield takeEvery('TRANSACTION_RETURN', invalidateCache)
}
