import {
  takeEvery,
  select,
  take,
  put,
  getContext
} from 'redux-saga/effects'
import {
  eventChannel,
  END
} from 'redux-saga'
import { createNode } from '~/services/createNode'
import { promisify } from '~/utils/common-util'
import multihashes from 'multihashes'
import { toastr } from '~/toastr'

const HEARTBEAT_SUBSCRIPTION_CHANNEL = '/MedCredits/Heartbeat'

function heartbeatBody(address) {
  return Buffer.from(JSON.stringify(
    {
      type: 'DOCTOR_HEARTBEAT',
      address,
      message: 'Heartbeat'
    }
  ))
}

function* startNode() {
  const node = yield promisify(cb => createNode(cb))

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
    // console.log('Got connection to: ' + idStr)
  })

  node.on('peer:disconnect', (peerInfo) => {
    const idStr = peerInfo.id.toB58String()
    // console.log('Lost connection to: ' + idStr)
  })

  yield promisify(cb => node.start(cb))
  const idStr = node.peerInfo.id.toB58String()
  // console.log('Node is listening on', idStr)
  return node
}

function createPubsubChannel (node) {
  return eventChannel(emit => {

    const messageHandler = (message) => {
      if (message.from !== node.peerInfo.id.toB58String()) {
        const body = JSON.parse(Buffer.from(message.data).toString())
        emit({ type: 'HEARTBEAT_MESSAGE', message, body, date: new Date() })
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

function* startPubsub(node) {
  const channel = createPubsubChannel(node)
  while (true) {
    yield put(yield take(channel))
  }
}

function* publishMessage(node, action) {
  const address = yield select((state) => state.sagaGenesis.accounts[0])
  node.pubsub.publish(
    HEARTBEAT_SUBSCRIPTION_CHANNEL,
    heartbeatBody(address),
    (err) => {
      if (err) { return console.error('Could not deliver message: ', err) }
    })
}

export default function* () {
  const node = yield startNode()
  yield takeEvery('SEND_HEARTBEAT', publishMessage, node)
  yield startPubsub(node)
}
