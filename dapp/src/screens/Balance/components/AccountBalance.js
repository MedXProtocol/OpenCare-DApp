import React, { Component } from 'react';
import {getSelectedAccount, getMedXTokenBalance} from '../../../utils/web3-util';


class AccountBalance extends Component {
    constructor(){
        super()

        this.state = {
            address: getSelectedAccount(),
            balance: null
        };
    }

    updateAddress = (event) => {
        this.setState({address: event.target.value});
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.getBalance();
    }

    getBalance = async (hash) => {
        const balance = await getMedXTokenBalance(this.state.address);
        this.setState({balance: balance.toNumber()});
    }

    render() {
        return (
            <div className="container">
            <h2>Account Balance</h2>
            <form 
                onSubmit={this.handleSubmit}
            >
                <div className="form-group">
                <label htmlFor="hash">Account Address:</label>
                <input 
                    className="form-control" 
                    id="hash"
                    value={this.state.address}
                    onChange={this.updateAddress}
                    required
                />
                </div>
                <button type="submit" className="btn btn-default" >Get Balance</button>
                <p hidden={!this.state.saving}>Submit in progress...</p>
                <p>Balance: {this.state.balance} MEDX</p>
            </form>
            </div>
        );
    }
}

export default AccountBalance;