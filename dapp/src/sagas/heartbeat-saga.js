import {
  getContext,
  select,
  take,
  cancel,
  takeEvery,
  put,
  fork,
  spawn,
  call
} from 'redux-saga/effects'
import {
  delay,
  eventChannel,
  END
} from 'redux-saga'

const HEARTBEAT_TOPIC = '0x4ea67bea'
const HEARTBEAT_INTERVAL = 2000
const MAX_LIFETIME = HEARTBEAT_INTERVAL * 2

function createHeartbeatChannel(web3, symKeyId) {
  return eventChannel(emit => {
    web3.shh.subscribe('messages', {
      symKeyId,
      topics: [HEARTBEAT_TOPIC],
      minPow: 0.05
    }, (error, message, subscription) => {
      if (error) {
        emit(END)
      } else {
        emit({ type: 'HEARTBEAT_MESSAGE', message, subscription })
      }
    })

    return () => {
      web3.shh.clearSubscriptions()
    }
  })
}

function* startHeartbeatSubscription(web3, symKeyId, lastHeartbeatTime) {
  const channel = createHeartbeatChannel(web3, symKeyId)
  try {
    while (true) {
      const action = yield take(channel)
      yield call(heartbeatMessage, lastHeartbeatTime, action)
    }
  } catch (error) {
    console.log(error)
  }
}

function* postHeartbeat(symKeyId, address) {
  const web3 = yield getContext('web3')
  try {
    yield web3.shh.post({
      symKeyId,
      ttl: 4,
      topic: HEARTBEAT_TOPIC,
      payload: address,
      powTime: 4,
      powTarget: 0.1
    })
  } catch (error) {
    console.error(error)
    yield put({ type: 'WEB3_SHH_ERROR', error })
  }
}

function skippedABeat(lastHeartbeatTime, address) {
  const lastTime = lastHeartbeatTime[address]
  return !lastTime || ((new Date() - lastTime) >= MAX_LIFETIME)
}

function* heartbeatMessage(lastHeartbeatTime, { message }) {
  const address = message.payload
  if (!address) {
    console.warn('Missing address: ', message )
    return
  }
  const date = new Date()

  if (skippedABeat(lastHeartbeatTime, address)) {
    yield put({ type: 'USER_ONLINE', address: address.toLowerCase(), date })
  }

  lastHeartbeatTime[address] = date

  yield spawn(function* () {
    // If we haven't received a heartbeat within two intervals, we can assume death
    yield call(delay, MAX_LIFETIME)
    if (skippedABeat(lastHeartbeatTime, address)) {
      yield put({ type: 'USER_OFFLINE', address: address.toLowerCase(), date: new Date() })
    }
  })
}

function* startHeartbeat(symKeyId) {
  while (true) {
    const address = yield select(state => state.sagaGenesis.accounts[0])
    const isAvailable = yield select(state => state.heartbeat.isAvailable)
    if (address && isAvailable) {
      yield call(postHeartbeat, symKeyId, address)
    }
    yield call(delay, HEARTBEAT_INTERVAL)
  }
}

export default function* () {
  yield takeEvery('WEB3_SHH_INITIALIZED', function* ({ web3, symKeyId }) {
    const lastHeartbeatTime = {}
    const subscriptionTask = yield fork(startHeartbeatSubscription, web3, symKeyId, lastHeartbeatTime)
    const heartbeatTask = yield fork(startHeartbeat, symKeyId)
    yield take('WEB3_SHH_DISCONNECT')
    yield cancel(subscriptionTask)
    yield cancel(heartbeatTask)
  })
}
