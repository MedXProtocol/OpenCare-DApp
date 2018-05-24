import React, { Component } from 'react';
import './AccountAddress.css';
import get from 'lodash.get'
import { connect } from 'react-redux'

function mapStateToProps(state, ownProps) {
  const account = get(state, 'accounts[0]')
  return {
    account
  }
}

const AccountAddress = connect(mapStateToProps)(class _AccountAddress extends Component {
    render() {
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
                                {this.props.account}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
})

export default AccountAddress
