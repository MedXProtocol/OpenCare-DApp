import React, { Component } from 'react';
import {getSelectedAccountBalance} from '../utils/web3-util';
import './AccountBalance.css';
import { withMedXToken } from '@/drizzle-helpers/with-medx-token'

class AccountBalance extends Component {
    constructor(props) {
      super(props)
      this.init(props)
    }

    componentWillReceiveProps (props) {
      this.init(props)
    }

    init (props) {
      if (props.drizzleInitialized && props.accounts[0]) {
        this.dataKey = props.MedXToken.balanceOf.cacheCall(props.accounts[0])
      }
    }

    render() {
      if (this.dataKey) {
        var balance = this.props.MedXToken.balanceOf.value(this.dataKey)
      }

        return (
            <div className="card card-account-balance">
                <div className="card-header">
                    <div className="row">
                        <div className="col-xs-2">
                            <div className="icon-big icon-warning text-center">
                                <i className="ti-server"></i>
                            </div>
                        </div>
                        <div className="col-xs-10 text-right">
                            <h4 className="card-title">Balance</h4>
                            <p className="category">MEDX tokens balance</p>
                        </div>
                    </div>
                </div>
                <div className="card-content">
                    <div className="row">
                        <div className="col-xs-12">
                            <div className="numbers">
                                {balance} MEDX
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withMedXToken(AccountBalance)
