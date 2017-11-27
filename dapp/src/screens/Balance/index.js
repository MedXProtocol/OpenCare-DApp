import React, { Component } from 'react';
import AccountBalance from './components/AccountBalance';
import MintTokens from './components/MintTokens';

class Balance extends Component {
  
  render() {
    return (
        <div>
            <AccountBalance />
            <MintTokens />
        </div>
    );
  }
}

export default Balance;
