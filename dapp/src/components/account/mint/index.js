import React, { Component } from 'react';
import { MainLayoutContainer } from '~/layouts/MainLayout';
import { MintTokensContainer } from './MintTokens';

export const Mint = class extends Component {
  render() {
    return (
      <MainLayoutContainer>
        <MintTokensContainer />
      </MainLayoutContainer>
    );
  }
}
