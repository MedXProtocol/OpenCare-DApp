import React, { Component } from 'react';
import {getSelectedAccountBalance} from '../utils/web3-util';
import './AccountBalance.css';

class AccountBalance extends Component {
    constructor(){
        super()

        this.state = {
            balance: ''
        };
    }

    async componentDidMount() {
        const accountBalance = await getSelectedAccountBalance();
        
        this.setState({balance: accountBalance.toNumber()});
    }
  
    render() {
        return (
            <div className="card card-account-address">
                <div className="card-header">
                    <div className="row">
                        <div className="col-xs-2">
                            <div class="icon-big icon-warning text-center">
                                <i class="ti-server"></i>
                            </div>
                        </div>
                        <div className="col-xs-10 text-right">
                            <h4 className="card-title">Balance</h4>
                            <p class="category">MEDX tokens balance</p>
                        </div>
                    </div>
                </div>
                <div className="card-content">
                    <div className="row">
                        <div className="col-xs-12">
                            <div className="numbers">
                                {this.state.balance} MEDX
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default AccountBalance;