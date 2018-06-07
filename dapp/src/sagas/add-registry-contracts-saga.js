import {
  select,
  getContext
} from 'redux-saga/effects'
import {
  contractByName
} from '~/saga-genesis/state-finders'
import {
  addContract,
  cacheCall
} from '~/saga-genesis/sagas'

function* lookupAndAddContract(web3, name) {
  const Registry = yield select(contractByName, 'Registry')
  const address = yield cacheCall(Registry, 'lookup', web3.utils.sha3(name))
  yield addContract({address, name, contractKey: name})
}

export default function* ({ web3 }) {
  yield lookupAndAddContract(web3, 'CaseManager')
  yield lookupAndAddContract(web3, 'DoctorManager')
  yield lookupAndAddContract(web3, 'AccountManager')
}
