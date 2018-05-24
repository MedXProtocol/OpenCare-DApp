import { getContext, takeEvery } from 'redux-saga/effects'

function* invalidateCache ({call, receipt}) {
  const contractRegistry = getContext('contractRegistry')
  // const MedXToken = contractRegistry.requireAddressByName('MedXToken')
  // if (call.address === MedXToken && call.)
}

export default function* () {
  yield takeEvery('WEB3_SEND_RETURN', invalidateCache)
}
