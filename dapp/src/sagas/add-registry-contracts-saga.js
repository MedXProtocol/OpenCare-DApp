import {
  select,
  all
} from 'redux-saga/effects'
import {
  contractByName
} from '~/saga-genesis/state-finders'
import {
  addContract,
  web3Call
} from '~/saga-genesis/sagas'

function* lookupAndAddContract(web3, name) {
  const Registry = yield select(contractByName, 'Registry')
  const address = yield web3Call(Registry, 'lookup', web3.utils.sha3(name))
  yield addContract({address, name, contractKey: name})
}

export default function* ({ web3 }) {
  yield all([
    lookupAndAddContract(web3, 'CaseManager'),
    lookupAndAddContract(web3, 'DoctorManager'),
    lookupAndAddContract(web3, 'AccountManager'),
    lookupAndAddContract(web3, 'BetaFaucet')
  ])
}
