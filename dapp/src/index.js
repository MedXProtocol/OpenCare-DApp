import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './error-boundary'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next';
import i18n from '~/config/i18n';
import './index.css'
import App from '~/components/App'
import store from '~/store'

window.addEventListener('load', () => {
  let coreApp =
    <ErrorBoundary>
      <I18nextProvider i18n={ i18n }>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </I18nextProvider>
    </ErrorBoundary>

  ReactDOM.render(coreApp, document.getElementById('root'))
})
