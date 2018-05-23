import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import sagas from './sagas'
import reducers from './reducers'
import createContractRegistry from './create-contract-registry'
import getWeb3 from '@/get-web3'

const storeFactory = function () {
  return createContractRegistry().then((contractRegistry) => {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    const sagaMiddleware = createSagaMiddleware({
      context: {
        contractRegistry,
        web3: getWeb3(),
        cacheContexts: {}
      }
    })
    let store = createStore(reducers, undefined, composeEnhancers(applyMiddleware(sagaMiddleware)))
    sagaMiddleware.run(sagas)
    return {
      store,
      contractRegistry
    }
  }).catch(console.error)
}

const store = storeFactory()

export default store
