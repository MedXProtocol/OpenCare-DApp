import {
  takeEvery,
  select,
  take,
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
import { createNode } from '~/services/createNode'
import { promisify } from '~/utils/common-util'

const HEARTBEAT_SUBSCRIPTION_CHANNEL = '/MedCredits/Heartbeat'
const HEARTBEAT_INTERVAL = 2000
const MAX_LIFETIME = HEARTBEAT_INTERVAL * 2

function* startNode() {
  const node = yield promisify(cb => createNode(cb))
  yield promisify(cb => node.start(cb))

  node.on('peer:discovery', (peerInfo) => {
    const idStr = peerInfo.id.toB58String()
    // console.log('Discovered: ' + idStr)
    node.dial(peerInfo, (err, conn) => {
      if (err) { console.error(err) }
      else { return console.log('Dialled:', idStr, conn) }
    })
  })

  node.on('peer:connect', (peerInfo) => {
    const idStr = peerInfo.id.toB58String()
    console.log('Got connection to: ' + idStr)
  })

  node.on('peer:disconnect', (peerInfo) => {
    // const idStr = peerInfo.id.toB58String()
    // console.log('Lost connection to: ' + idStr)
  })

  const idStr = node.peerInfo.id.toB58String()
  console.log('Node is listening on', idStr)
  return node
}

function createPubsubChannel (node) {
  return eventChannel(emit => {
    const messageHandler = (message) => {
      if (message.from !== node.peerInfo.id.toB58String()) {
        const dataJson = JSON.parse(Buffer.from(message.data).toString())
        emit({ type: 'HEARTBEAT_MESSAGE', message, dataJson, date: new Date() })
      }
    }

    node.pubsub.subscribe(HEARTBEAT_SUBSCRIPTION_CHANNEL,
      messageHandler,
      (error) => {
        if (error) {
          emit({ type: 'HEARTBEAT_SUBSCRIPTION_FAILURE', error })
          emit(END)
        } else {
          emit({ type: 'HEARTBEAT_SUBSCRIBED' })
        }
      }
    )

    return () => {
      node.pubsub.unsubscribe(HEARTBEAT_SUBSCRIPTION_CHANNEL, messageHandler)
    }
  })
}

function* startPubsub(node, lastHeartbeatTime) {
  const channel = createPubsubChannel(node)
  while (true) {
    const action = yield take(channel)
    if (action.type === 'HEARTBEAT_MESSAGE') {
      yield call(heartbeatMessage, lastHeartbeatTime, action)
    } else {
      yield put(action)
    }
  }
}

function heartbeatBody(address) {
  return Buffer.from(JSON.stringify(
    {
      type: 'DOCTOR_HEARTBEAT',
      address,
      message: 'Heartbeat'
    }
  ))
}

function skippedABeat(lastHeartbeatTime, address) {
  const lastTime = lastHeartbeatTime[address]
  return !lastTime || ((new Date() - lastTime) >= MAX_LIFETIME)
}

function* heartbeatMessage(lastHeartbeatTime, { message, dataJson, date }) {
  const { address } = dataJson
  if (!address) { return console.error('Missing address: ', dataJson) }

  if (skippedABeat(lastHeartbeatTime, address)) {
    yield put({ type: 'USER_ONLINE', address, date })
  }

  lastHeartbeatTime[address] = date

  yield spawn(function* () {
    // If we haven't received a heartbeat within two intervals, we can assume death
    yield call(delay, MAX_LIFETIME)
    if (skippedABeat(lastHeartbeatTime, address)) {
      yield put({ type: 'USER_OFFLINE', address, date: new Date() })
    }
  })
}

function* sendHeartbeat(node) {
  const address = yield select((state) => state.sagaGenesis.accounts[0])
  node.pubsub.publish(
    HEARTBEAT_SUBSCRIPTION_CHANNEL,
    heartbeatBody(address),
    (err) => {
      if (err) { return console.error('Could not deliver message: ', err) }
    }
  )
}

function* startHeartbeat(node) {
  while (true) {
    yield call(sendHeartbeat, node)
    yield call(delay, HEARTBEAT_INTERVAL)
  }
}

export default function* () {
  const node = yield startNode()
  const lastHeartbeatTime = {}
  yield fork(startHeartbeat, node)
  yield fork(startPubsub, node, lastHeartbeatTime)
  yield takeEvery('SEND_HEARTBEAT', sendHeartbeat, node)
}
