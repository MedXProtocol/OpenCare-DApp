import React, { Component } from 'react';
import {getSelectedAccount} from '../utils/web3-util';
import './AccountAddress.css';

class AccountAddress extends Component {
    constructor(){
        super()

        this.state = {
            selectedAccount: ''
        };
    }

    componentDidMount(){
        this.setState({selectedAccount: getSelectedAccount()});
    }
  
    render() {
        return (
            <div className="card card-account-address">
                <div className="card-header">
                    <div className="row">
                        <div className="col-xs-2">
                            <div className="icon-big icon-success text-center">
                                <i className="ti-wallet"></i>
                            </div>
                        </div>
                        <div className="col-xs-10 text-right">
                            <h4 className="card-title">Address</h4>
                            <p class="category">Address selected in your wallet or MetaMask</p>
                        </div>
                    </div>
                </div>
                <div className="card-content">
                    <div className="row">
                        <div className="col-xs-12">
                            <p className="text-right">
                                {this.state.selectedAccount}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default AccountAddress;