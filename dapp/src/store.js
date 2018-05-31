import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import sagas from './sagas'
import reducers from './reducers'
import { ContractRegistry, CacheScope } from '@/saga-genesis'
import contractRegistryOptions from './contract-registry-options'

export const contractRegistry = new ContractRegistry(contractRegistryOptions)
export const cacheScope = new CacheScope()

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const sagaMiddleware = createSagaMiddleware({
  context: {
    contractRegistry,
    cacheScope
  }
})
let store = createStore(reducers, undefined, composeEnhancers(applyMiddleware(sagaMiddleware)))
sagaMiddleware.run(sagas)

export default store
