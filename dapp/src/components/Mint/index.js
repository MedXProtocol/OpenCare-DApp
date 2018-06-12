import React, { Component } from 'react';
import { MainLayout } from '~/layouts/MainLayout';
import MintTokens from './components/MintTokens';

class Mint extends Component {

  render() {
    return (
        <MainLayout>
            <MintTokens />
        </MainLayout>
    );
  }
}

export default Mint;
