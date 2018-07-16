import React, { Component } from 'react';
import { MintTokensContainer } from './MintTokens';
import { PageTitle } from '~/components/PageTitle'

export const Mint = class _Mint extends Component {
  render() {
    return (
      <div>
        <PageTitle renderTitle={(t) => t('pageTitles.mint')} />
        <MintTokensContainer />
      </div>
    );
  }
}
