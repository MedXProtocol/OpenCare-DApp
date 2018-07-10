import PeerInfo from 'peer-info'
import { newNode } from '~/services/newNode'

export function createNode(callback) {
  PeerInfo.create((err, peerInfo) => {
    if (err) {
      return callback(err)
    }

    const peerIdStr = peerInfo.id.toB58String()

    const ma = `/dns4/${process.env.REACT_APP_IPFS_HOSTNAME}/tcp/${process.env.REACT_APP_P2P_WEBRTC_STAR_PORT}/wss/p2p-webrtc-star/ipfs/${peerIdStr}`

    peerInfo.multiaddrs.add(ma)

    const node = newNode({
      peerInfo
    })

    node.idStr = peerIdStr
    callback(null, node)
  })
}
