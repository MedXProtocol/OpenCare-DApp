import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { generateContractsInitialState } from 'drizzle'
import drizzleOptions from './drizzleOptions'
import sagas from './sagas'
import reducers from './reducers'

const storeFactory = function () {
  return drizzleOptions().then((options) => {
    const sagaMiddleware = createSagaMiddleware()
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    const initialState = {
      contracts: generateContractsInitialState(options)
    }
    let store = createStore(reducers, initialState, composeEnhancers(applyMiddleware(sagaMiddleware)))
    sagaMiddleware.run(sagas)
    return {
      store,
      options
    }
  }).catch((error) => console.error(error))
}

const store = storeFactory()

export default store
