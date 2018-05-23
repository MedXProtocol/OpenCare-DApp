import React, { Component } from 'react';
import './AccountAddress.css';
import get from 'lodash.get'

class AccountAddress extends Component {
    render() {
      var account = get(this.props, 'accounts[0]')
        return (
            <div className="card card-account-address">
                <div className="card-header">
                    <div className="row">
                        <div className="col-xs-2">
                            <div className="icon-big icon-danger text-center">
                                <i className="ti-wallet"></i>
                            </div>
                        </div>
                        <div className="col-xs-10 text-right">
                            <h4 className="card-title">Address</h4>
                            <p className="category">Address selected in your wallet or MetaMask</p>
                        </div>
                    </div>
                </div>
                <div className="card-content">
                    <div className="row">
                        <div className="col-xs-12">
                            <p className="text-right">
                                {account}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default AccountAddress
