import React, { Component } from 'react';
import { MainLayout } from '~/layouts/MainLayout';
import { MintTokensContainer } from './MintTokens';

export const Mint = class extends Component {
  render() {
    return (
      <MainLayout>
        <MintTokensContainer />
      </MainLayout>
    );
  }
}
