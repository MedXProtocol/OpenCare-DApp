import {
  put,
  select
} from 'redux-saga/effects'

export function* addContract({address, name, contractKey, networkId}) {
  if (!networkId) {
    networkId = yield select((state) => state.sagaGenesis.network.networkId)
  }
  yield put({type: "ADD_CONTRACT", address, name, contractKey, networkId})
}
