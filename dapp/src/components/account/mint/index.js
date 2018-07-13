import React, { Component } from 'react';
import { MainLayoutContainer } from '~/layouts/MainLayout';
import { MintTokensContainer } from './MintTokens';
import { PageTitle } from '~/components/PageTitle'

export const Mint = class extends Component {
  render() {
    return (
      <MainLayoutContainer>
        <PageTitle renderTitle={(t) => t('pageTitles.mint')} />
        <MintTokensContainer />
      </MainLayoutContainer>
    );
  }
}
