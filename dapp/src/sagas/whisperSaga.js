import {
  getContext,
  takeLatest,
  put,
  select,
  call
} from 'redux-saga/effects'
import {
  delay
} from 'redux-saga'

const URLS = {
  1: process.env.REACT_APP_WHISPER_MAINNET_WEBSOCKET_URL,
  3: process.env.REACT_APP_WHISPER_ROPSTEN_WEBSOCKET_URL,
  4: process.env.REACT_APP_WHISPER_RINKEBY_WEBSOCKET_URL,
  1234: process.env.REACT_APP_WHISPER_RINKEBY_WEBSOCKET_URL
}

export function* whisperSaga() {
  yield takeLatest('WEB3_SHH_INIT', function* () {
    const web3 = yield getContext('web3')

    const networkId = yield select(state => state.sagaGenesis.network.networkId)
    let url = URLS[networkId]
    if (!url) {
      url = URLS[1234]
    }

    while (true) {
      try {
        web3.shh.setProvider(url)
        break
      } catch (e) {
        console.error('Error connecting to Whisper: ', e)
        yield call(delay, 2000)
      }
    }
    const symKeyId = yield web3.shh.generateSymKeyFromPassword('hippocrates')
    yield put({ type: 'WEB3_SHH_INITIALIZED', web3, symKeyId })
  })
}
