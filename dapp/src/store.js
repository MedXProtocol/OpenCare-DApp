import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { generateContractsInitialState } from 'drizzle'
import drizzleOptions from './drizzleOptions'
import sagas from './sagas'
import reducers from './reducers'

const sagaMiddleware = createSagaMiddleware()

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const initialState = {
  contracts: generateContractsInitialState(drizzleOptions)
}
export const store = createStore(reducers, initialState, composeEnhancers(applyMiddleware(sagaMiddleware)))

sagaMiddleware.run(sagas)
