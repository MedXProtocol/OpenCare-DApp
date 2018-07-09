import PeerInfo from 'peer-info'
import { newNode } from '~/services/newNode'
import multiaddr from 'multiaddr'

export function createNode(callback) {
  PeerInfo.create((err, peerInfo) => {
    if (err) {
      return callback(err)
    }

    const peerIdStr = peerInfo.id.toB58String()

    // const ma = `/ip4/127.0.0.1/tcp/9090/wss/p2p-webrtc-star/ipfs/${peerIdStr}`
    // const ma = `/ip4/127.0.0.1/tcp/9090/wss/p2p-websocket-star/ipfs/${peerIdStr}`
    const ma = `/ip4/127.0.0.1/tcp/9090/wss/p2p-webrtc-star/ipfs/${peerIdStr}`
    peerInfo.multiaddrs.add(ma)

    const node = newNode({
      peerInfo
    })

    node.idStr = peerIdStr
    callback(null, node)
  })
}
