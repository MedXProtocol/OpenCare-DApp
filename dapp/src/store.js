import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import sagas from './sagas'
import reducers from './reducers'
import { ContractRegistry, CallCountRegistry } from '~/saga-genesis'
import contractRegistryOptions from './contract-registry-options'

export const contractRegistry = new ContractRegistry(contractRegistryOptions)
export const callCountRegistry = new CallCountRegistry()

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const sagaMiddleware = createSagaMiddleware({
  context: {
    contractRegistry,
    callCountRegistry
  }
})
let store = createStore(reducers, undefined, composeEnhancers(applyMiddleware(sagaMiddleware)))
sagaMiddleware.run(sagas)

export default store
