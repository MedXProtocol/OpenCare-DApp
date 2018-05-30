import {
  select
} from 'redux-saga/effects'
import {
  takeWeb3Initialized,
  addContract,
  cacheCall
 } from '@/saga-genesis/sagas'

import medXTokenContractConfig from '#/MedXToken.json'
import registryConfig from '#/Registry.json'

function* addTruffleArtifactAddresses(config, name) {
  var networkIds = Object.keys(config.networks)
  yield* networkIds.map(function* (networkId) {
    var networkConfig = config.networks[networkId]
    yield addContract({
      address: networkConfig.address,
      name,
      networkId,
      contractKey: name
    })
  })
}

export default function* () {
  yield addTruffleArtifactAddresses(registryConfig, 'Registry')
  yield addTruffleArtifactAddresses(medXTokenContractConfig, 'MedXToken')
}
