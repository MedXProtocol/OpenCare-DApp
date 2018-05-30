import accountsSagas from './accounts/accounts-sagas'
import blocksSagas from './blocks/blocks-sagas'
import cacheSagas from './cache/cache-sagas'
import callsSagas from './calls/calls-sagas'
import networkSagas from './network/network-sagas'
import sendsSagas from './sends/sends-sagas'

export default function* () {
  yield all(
    [
      accountsSagas(),
      blocksSagas(),
      cacheSagas(),
      callsSagas(),
      networkSagas(),
      sendsSagas()
    ]
  )
}
