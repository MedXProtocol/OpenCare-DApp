import { newNode } from '~/services/newNode'

export async function createNode(callback) {
  const PeerInfo = await import(/* webpackChunkName: 'p2p' */ 'peer-info')
  const multiaddr = await import(/* webpackChunkName: 'p2p' */ 'multiaddr')

  PeerInfo.create((err, peerInfo) => {
    if (err) {
      return callback(err)
    }

    const peerIdStr = peerInfo.id.toB58String()

    const webrtcMa = multiaddr(`${process.env.REACT_APP_P2P_WEBRTC_STAR_MULTIADDR_BASE_URL}/${peerIdStr}`)
    peerInfo.multiaddrs.add(webrtcMa)

    const wsMa = multiaddr(`${process.env.REACT_APP_P2P_WEBSOCKET_STAR_MULTIADDR_BASE_URL}/${peerIdStr}`)
    peerInfo.multiaddrs.add(wsMa)

    newNode({ peerInfo }).then((node) => {
      node.idStr = peerIdStr
      callback(null, node)
    })
  })
}
