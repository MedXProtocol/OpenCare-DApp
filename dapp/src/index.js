import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './error-boundary'
import { DrizzleProvider } from 'drizzle-react'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'font-awesome/css/font-awesome.min.css'
import './assets/sass/paper-dashboard/paper-dashboard.css'
import './assets/css/themify-icons.css'
import './assets/sass/site.css'
import './index.css'
import App from './App'
import storePromise from '@/store'

window.addEventListener('load', () => {
  storePromise.then(({store, options}) => {

    let coreApp =
      <DrizzleProvider options={options} store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DrizzleProvider>

    if (process.env.NODE_ENV === 'production') {
      coreApp =
        <ErrorBoundary>
          {coreApp}
        </ErrorBoundary>
    }

    ReactDOM.render(coreApp, document.getElementById('root'))
  })
})
