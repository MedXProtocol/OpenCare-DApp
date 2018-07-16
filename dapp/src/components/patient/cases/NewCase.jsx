import React, { Component } from 'react';
import { CreateCaseContainer } from './CreateCase';
import { PageTitle } from '~/components/PageTitle'

export const NewCase = class _NewCase extends Component {
  render() {
    return (
      <div>
        <PageTitle renderTitle={(t) => t('pageTitles.newCase')} />
        <div className="container">
          <div className="row">
            <div className="col-xs-12">
              <CreateCaseContainer />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
