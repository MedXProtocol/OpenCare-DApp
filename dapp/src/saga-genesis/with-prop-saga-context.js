import getWeb3 from '@/get-web3'
import { withPropSaga } from '@/saga-genesis/with-prop-saga'
import { sagaCacheContext } from '@/saga-genesis/saga-cache-context'
import contractRegistry from '@/contract-registry'

export function withPropSagaContext(saga, Component) {
  return withPropSaga(sagaCacheContext({saga, web3: getWeb3(), contractRegistry}), Component)
}
