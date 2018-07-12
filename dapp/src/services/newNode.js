export async function newNode(_options) {
  const WebRTCStar = await import(/* webpackChunkName: 'p2p' */ 'libp2p-webrtc-star')
  const Mplex = await import(/* webpackChunkName: 'p2p' */ 'libp2p-mplex')
  const SECIO = await import(/* webpackChunkName: 'p2p' */ 'libp2p-secio')
  const defaultsDeep = await import(/* webpackChunkName: 'p2p' */ '@nodeutils/defaults-deep')
  const libp2p = await import(/* webpackChunkName: 'p2p' */ 'libp2p')

  const wrtcStar = new WebRTCStar({ id: _options.peerInfo.id })

  const defaults = {
    modules: {
      transport: [
        wrtcStar
      ],
      streamMuxer: [
        Mplex
      ],
      connEncryption: [
        SECIO
      ],
      peerDiscovery: [
        wrtcStar.discovery
      ]
    },
    config: {
      peerDiscovery: {
        webRTCStar: {
          enabled: true
        }
      },
      EXPERIMENTAL: {
        dht: false,
        pubsub: true
      },
      dht: {
        kBucketSize: 20
      }
    }
  }

  const allOptions = defaultsDeep(_options, defaults)

  return new libp2p(allOptions)
}
