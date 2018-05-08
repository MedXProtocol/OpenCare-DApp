import React from 'react';
import ReactDOM from 'react-dom';
import { Web3Provider } from 'react-web3';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from './error-boundary'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import './assets/sass/paper-dashboard/paper-dashboard.css';
import './assets/css/themify-icons.css';
import './assets/sass/site.css';
import './index.css';
import App from './App';

ReactDOM.render(
    <ErrorBoundary>
      <Web3Provider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Web3Provider>
    </ErrorBoundary>,
    document.getElementById('root')
);
