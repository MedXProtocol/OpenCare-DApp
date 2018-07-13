import React, { Component } from 'react';
import { MainLayoutContainer } from '~/layouts/MainLayout';
import { CreateCaseContainer } from './CreateCase';
import { PageTitle } from '~/components/PageTitle'

export const NewCase = class extends Component {
  render() {
    return (
      <MainLayoutContainer>
        <PageTitle renderTitle={(t) => t('pageTitles.newCase')} />
        <div className="container">
          <div className="row">
            <div className="col-xs-12">
              <CreateCaseContainer />
            </div>
          </div>
        </div>
      </MainLayoutContainer>
    );
  }
}
