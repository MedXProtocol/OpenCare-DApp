import {
  all,
  setContext
} from 'redux-saga/effects'

import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'

import cacheScopeSagas from '~/saga-genesis/cache-scope/cache-scope-sagas'
import cacheCallSagas from '~/saga-genesis/call-cache/call-cache-sagas'

import { sagaGenesis as reducers } from '~/saga-genesis/reducers'
import { ContractRegistry, CallCountRegistry } from '~/saga-genesis'
import contractRegistryOptions from './contract-registry-options'

export const contractRegistry = new ContractRegistry(contractRegistryOptions)
export const callCountRegistry = new CallCountRegistry()

export const sagaMiddleware = createSagaMiddleware({
  context: {
    contractRegistry,
    callCountRegistry
  }
})

export const store = createStore(
  reducers,
  applyMiddleware(sagaMiddleware)
)

sagaMiddleware.run(function* () {
  yield all(
    [
      cacheCallSagas(),
      cacheScopeSagas()
    ]
  )
})
