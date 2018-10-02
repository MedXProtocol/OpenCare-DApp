import {
  select,
  all
} from 'redux-saga/effects'
import {
  contractByName,
  addContract,
  web3Call
} from '~/saga-genesis'
const debug = require('debug')('addRegistryContractsSaga.js')

function* lookupAndAddContract(web3, name) {
  const Registry = yield select(contractByName, 'Registry')
  const address = yield web3Call(Registry, 'lookup', web3.utils.sha3(name))
  if (address) {
    yield addContract({address, name, contractKey: name})
    debug(`Added ${name} at ${address}`)
  } else {
    debug(`Skipping ${name} which is unregistered`)
  }
}

export default function* ({ web3 }) {
  yield all([
    lookupAndAddContract(web3, 'WrappedEther'),
    lookupAndAddContract(web3, 'Dai'),
    lookupAndAddContract(web3, 'AdminSettings'),
    lookupAndAddContract(web3, 'CaseManager'),
    lookupAndAddContract(web3, 'CaseDiagnosingDoctor'),
    lookupAndAddContract(web3, 'CaseLifecycleManager'),
    lookupAndAddContract(web3, 'CaseScheduleManager'),
    lookupAndAddContract(web3, 'CaseFirstPhaseManager'),
    lookupAndAddContract(web3, 'CaseSecondPhaseManager'),
    lookupAndAddContract(web3, 'CasePaymentManager'),
    lookupAndAddContract(web3, 'CaseStatusManager'),
    lookupAndAddContract(web3, 'DoctorManager'),
    lookupAndAddContract(web3, 'AccountManager'),
    lookupAndAddContract(web3, 'BetaFaucet'),
    lookupAndAddContract(web3, 'FromBlockNumber')
  ])
}
