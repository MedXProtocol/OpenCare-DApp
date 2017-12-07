import React, { Component } from 'react';
import MainLayout from '../../layouts/MainLayout';
import Buy from './components/Buy';
import AccountAddress from '../../components/AccountAddress';
import AccountBalance from '../../components/AccountBalance';


class Wallet extends Component {
  render() {
    return (
      <MainLayout>
        <div className="container">
          <div className="row">
            <div className="col-lg-3 col-md-12">
              <Buy />
            </div>
            <div className="col-lg-3 col-md-12">
              <AccountBalance />
            </div>
            <div className="col-lg-6 col-md-12">
              <AccountAddress />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}

export default Wallet;
