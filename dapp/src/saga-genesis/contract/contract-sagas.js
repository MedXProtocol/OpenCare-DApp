import {
  put,
  select
} from 'redux-saga/effects'
import {
  contractKeyByAddress
} from '../state-finders'

export function* addContract({address, name, contractKey, networkId}) {
  if (!networkId) {
    networkId = yield select((state) => state.sagaGenesis.network.networkId)
  }
  let existingContractKey = yield select(contractKeyByAddress, address)
  if (existingContractKey !== contractKey) {
    yield put({type: "ADD_CONTRACT", address, name, contractKey, networkId})
  }
}
