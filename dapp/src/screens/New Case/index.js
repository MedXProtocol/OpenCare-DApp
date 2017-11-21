import React, { Component } from 'react';
import {getCaseFactoryContract, getDefaultTxObj, waitForTxComplete} from '../../utils/web3-util'


class NewCase extends Component {
    constructor(){
        super()

        this.state = {
            hash: null,
            saving: false
        };
    }

    updateHash = (event) => {
        this.setState({hash: event.target.value});
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.setState({saving: true});
    }

    saveCase = (hash) => {
        const contract = getCaseFactoryContract();
        // contract.submitNewFile(title, ipfsHash, this.props.getDefaultTxObj(), function(error, result) {
        //     if(error) {
        //         alert(error); // eslint-disable-line 
        //         this.setState({saving: false});
        //     } else {
        //       this.props.waitForTxComplete(result, function() {
        //         browserHistory.push('/');
        //       });
        //     }
        // }.bind(this))
    }

    render() {
        return (
            <div className="container">
            <h2>New Case</h2>
            <form 
                onSubmit={this.handleSubmit}
            >
                <div className="form-group">
                <label htmlFor="hash">Hash:</label>
                <input 
                    className="form-control" 
                    id="hash"
                    onChange={this.updateHash}
                    required
                />
                </div>
                <button type="submit" className="btn btn-default" disabled={this.state.saving}>Submit</button>
                <p hidden={!this.state.saving}>Submit in progress...</p>
            </form>
            </div>
        );
    }
}

export default NewCase;
