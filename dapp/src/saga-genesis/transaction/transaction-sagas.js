import {
  select,
  put,
  getContext,
  call as sagaCall,
  takeEvery,
  take
} from 'redux-saga/effects'
import {
  eventChannel,
  END
} from 'redux-saga'
import { contractKeyByAddress } from '../state-finders'

function createTransactionEventChannel (web3, {transactionId, call, options, send}) {
  return eventChannel(emit => {

    let promiEvent = send(options)
      .on('confirmation', (confirmationNumber, receipt) => {
        emit({type: 'TRANSACTION_CONFIRMATION', transactionId, confirmationNumber, receipt})
        if (confirmationNumber > 3) {
          emit({type: 'TRANSACTION_CONFIRMED', transactionId, confirmationNumber, receipt})
          emit(END)
        }
      })
      .on('receipt', (receipt) => {
        emit({type: 'TRANSACTION_RECEIPT', transactionId, call, receipt})
      })
      .on('error', (error) => {
        emit({type: 'TRANSACTION_ERROR', transactionId, error})
        emit(END)
      })

    return () => {
      promiEvent.removeAllListeners()
    }
  })
}

export function* web3Send({ transactionId, call, options }) {
  const { address, method, args } = call
  try {
    const account = yield select(state => state.sagaGenesis.accounts[0])
    options = options || {
      from: account
    }
    const contractRegistry = yield getContext('contractRegistry')
    const web3 = yield getContext('web3')
    const contractKey = yield select(contractKeyByAddress, address)
    const contract = contractRegistry.get(address, contractKey, web3)
    // console.log('web3Send: ', address, method, ...args, options)

    const send = contract.methods[method](...args).send

    const transactionChannel = createTransactionEventChannel(web3, {transactionId, call, options, send})
    while (true) {
      yield put(yield take(transactionChannel))
    }
  } catch (error) {
    console.error(error)
    yield put({type: 'TRANSACTION_ERROR', transactionId, call, error})
  }
}

export default function* () {
  yield takeEvery('SEND_TRANSACTION', web3Send)
}
