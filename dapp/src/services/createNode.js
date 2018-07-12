import PeerInfo from 'peer-info'
import { newNode } from '~/services/newNode'
import multiaddr from 'multiaddr'

export function createNode(callback) {
  PeerInfo.create((err, peerInfo) => {
    if (err) {
      return callback(err)
    }

    const peerIdStr = peerInfo.id.toB58String()

    const ma = multiaddr(`${process.env.REACT_APP_P2P_WEBRTC_STAR_MULTIADDR_BASE_URL}/${peerIdStr}`)
    peerInfo.multiaddrs.add(ma)
    const node = newNode({
      peerInfo
    })

    node.idStr = peerIdStr
    callback(null, node)
  })
}
