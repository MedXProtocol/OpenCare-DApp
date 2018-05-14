import React, { Component } from 'react';
import Spinner from '../../../components/Spinner';
import {getSelectedAccount, mintMedXTokens} from '../../../utils/web3-util';
import { withContextManager } from '@/drizzle-helpers/with-context-manager'
import get from 'lodash.get'

class MintTokens extends Component {
    constructor(props){
        super(props)

        this.state = {
            address: get(this.props, 'accounts[0]'),
            error: null,
            submitInProgress: false
        };
    }

    updateAddress = (event) => {
        this.setState({address: event.target.value});
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.mintTokens();
    }

    mintTokens = () => {
        this.setState({submitInProgress: true});
        mintMedXTokens(this.state.address, 1000, (error, result) => {
            if(error){
                this.onError(error);
            } else {
                this.onSuccess();
            }
        });
    }

    onSuccess = () => {
        this.setState({submitInProgress: false});
    }

    onError = (error) => {
        this.setState({error: error});
        this.setState({submitInProgress: false});
    }

    render() {
        return (
            <div className="card">
                <form
                    onSubmit={this.handleSubmit}
                    >
                    <div className="card-header">
                        <h4 className="card-title">Mint Tokens</h4>
                        <p className="category">Mint tokens to address below</p>
                    </div>
                    <div className="card-content">
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
                        <button type="submit" className="btn btn-default" disabled={this.state.submitInProgress}>Mint Tokens</button>
                    </div>
                </form>
                <Spinner loading={this.state.submitInProgress}/>
            </div>
        );
    }
}

export default withContextManager(MintTokens);
