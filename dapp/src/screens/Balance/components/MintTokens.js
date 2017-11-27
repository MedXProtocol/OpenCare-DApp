import React, { Component } from 'react';
import {getSelectedAccount, mintMedXTokens} from '../../../utils/web3-util';


class MintTokens extends Component {
    constructor(){
        super()

        this.state = {
            address: getSelectedAccount(),
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
            <div className="container">
            <h2>Mint Tokens</h2>
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
                <button type="submit" className="btn btn-default" disabled={this.state.submitInProgress}>Mint Tokens</button>
                <p hidden={!this.state.submitInProgress}>Submit in progress...</p>
                <p>Error: {this.state.error}</p>
            </form>
            </div>
        );
    }
}

export default MintTokens;