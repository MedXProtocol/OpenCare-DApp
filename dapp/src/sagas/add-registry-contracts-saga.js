import {
  select,
  all
} from 'redux-saga/effects'
import {
  contractByName,
  addContract,
  web3Call
} from '~/saga-genesis'

function* lookupAndAddContract(web3, name) {
  const Registry = yield select(contractByName, 'Registry')
  const address = yield web3Call(Registry, 'lookup', web3.utils.sha3(name))
  // console.log('called by add-registry-contracts-saga.js')
  yield addContract({address, name, contractKey: name})
}

export default function* ({ web3 }) {
  yield all([
    lookupAndAddContract(web3, 'CaseManager'),
    lookupAndAddContract(web3, 'CaseLifecycleManager'),
    lookupAndAddContract(web3, 'CaseScheduleManager'),
    lookupAndAddContract(web3, 'CaseStatusManager'),
    lookupAndAddContract(web3, 'DoctorManager'),
    lookupAndAddContract(web3, 'AccountManager'),
    lookupAndAddContract(web3, 'BetaFaucet')
  ])
}
