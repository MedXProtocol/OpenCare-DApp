import React, { Component } from 'react';
import { MainLayoutContainer } from '~/layouts/MainLayout';
import { CreateCaseContainer } from './CreateCase';

export const NewCase = class extends Component {
  render() {
    return (
      <MainLayoutContainer>
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
