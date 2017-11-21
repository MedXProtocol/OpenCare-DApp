import React from 'react';
import ReactDOM from 'react-dom';
import { Web3Provider } from 'react-web3';
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App'

ReactDOM.render(
    <Web3Provider>
        <App />
    </Web3Provider>,
    document.getElementById('root')
);
