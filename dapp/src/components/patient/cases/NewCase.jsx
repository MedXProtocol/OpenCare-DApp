import React, { Component } from 'react';
import { MainLayout } from '~/layouts/MainLayout';
import { CreateCaseContainer } from './CreateCase';

export const NewCase = class extends Component {
  render() {
    return (
      <MainLayout>
        <div className="container">
          <div className="row">
            <div className="col-xs-12">
              <CreateCaseContainer />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}
