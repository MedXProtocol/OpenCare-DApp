import { newNode } from '~/services/newNode'

export async function createNode(callback) {
  const PeerInfo = await import(/* webpackChunkName: 'p2p' */ 'peer-info')
  const multiaddr = await import(/* webpackChunkName: 'p2p' */ 'multiaddr')

  PeerInfo.create((err, peerInfo) => {
    if (err) {
      return callback(err)
    }

    const peerIdStr = peerInfo.id.toB58String()

    const ma = multiaddr(`${process.env.REACT_APP_P2P_WEBRTC_STAR_MULTIADDR_BASE_URL}/${peerIdStr}`)
    peerInfo.multiaddrs.add(ma)

    newNode({ peerInfo }).then((node) => {
      node.idStr = peerIdStr
      callback(null, node)
    })
  })
}
