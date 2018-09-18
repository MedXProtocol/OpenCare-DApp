import { put, select, call, fork } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { bugsnagClient } from '~/bugsnagClient'
import { customProviderWeb3 } from '~/utils/customProviderWeb3'

function* getEthBalance() {
  // const web3 = yield getContext('web3')
  const web3 = customProviderWeb3()
  const address = yield select((state) => state.sagaGenesis.accounts[0])
  if (web3 === undefined || address === undefined) {
    return
  }
  const balance = yield call(web3.eth.getBalance, address)
  const oldBalance = yield select(state => state.sagaGenesis.ethBalance.balance)
  console.log(balance, oldBalance)
  if (oldBalance !== balance) {
    yield put({type: 'ETH_BALANCE', balance})
  }
}

function* startEthBalancePolling() {
  while (true) {
    try {
      yield call(getEthBalance)
    } catch (e) {
      bugsnagClient.notify(e)
    }
    yield call(delay, 10000)
  }
}

export default function* () {
  yield fork(startEthBalancePolling)
}
