const WebRTCStar = require('libp2p-webrtc-star')
const Mplex = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const defaultsDeep = require('@nodeutils/defaults-deep')
const libp2p = require('libp2p')

export function newNode(_options) {
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
