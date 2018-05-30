import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './error-boundary'
import { Provider } from 'react-redux'
import { ContractRegistryProvider } from '@/saga-genesis'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'font-awesome/css/font-awesome.min.css'
import './assets/sass/paper-dashboard/paper-dashboard.css'
import './assets/css/themify-icons.css'
import './assets/sass/site.css'
import './index.css'
import App from './App'
import store, { contractRegistry } from '@/store'

window.addEventListener('load', () => {
  let coreApp =
    <ErrorBoundary>
      <ContractRegistryProvider contractRegistry={contractRegistry}>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </ContractRegistryProvider>
    </ErrorBoundary>

  ReactDOM.render(coreApp, document.getElementById('root'))
})
