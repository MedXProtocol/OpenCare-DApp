import { put, getContext, select, call, fork } from 'redux-saga/effects'
import { delay } from 'redux-saga'

function* getEthBalance() {
  const web3 = yield getContext('web3')
  const address = yield select((state) => state.sagaGenesis.accounts[0])

  if (web3 === undefined || address === undefined) {
    return
  }

  const balance = yield web3.eth.getBalance(address).then(weiBalance => {
    return parseFloat(web3.utils.fromWei(weiBalance, 'ether'))
  })

  const oldBalance = yield select((state) => state.ethBalance.balance)
  if (oldBalance !== balance) {
    yield put({type: 'ETH_BALANCE', balance})
  }
}

function* startEthBalancePolling() {
  while (true) {
    yield call(getEthBalance)
    yield call(delay, 2000)
  }
}

export default function* () {
  yield fork(startEthBalancePolling)
}
