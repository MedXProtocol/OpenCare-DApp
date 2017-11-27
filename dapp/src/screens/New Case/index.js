import React, { Component } from 'react';
import {createCase, uploadToSwarm} from '../../utils/web3-util';
import {uploadToIpfs} from '../../utils/ipfs-util';


class NewCase extends Component {
    constructor(){
        super()

        this.state = {
            hash: null,
            error: null,
            submitInProgress: false
        };
    }

    updateHash = (event) => {
        this.setState({hash: event.target.value});
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        this.setState({submitInProgress: true});
        const hash = await uploadToIpfs(this.state.hash);
        this.createNewCase(hash);
    }

    createNewCase = (hash) => {
        createCase(hash, (error, result) => {
            if(error !== null) {
                this.onError(error);
            } else {
                this.onSuccess();
            }
        });
    }

    onError = (error) => {
        this.setState({
            error: error,
            submitInProgress: false
        });
        
    }

    onSuccess = () => {
        this.setState({submitInProgress: false});
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
                <button type="submit" className="btn btn-default" disabled={this.state.submitInProgress}>Submit</button>
                <p hidden={!this.state.submitInProgress}>Submit in progress...</p>
            </form>
            </div>
        );
    }
}

export default NewCase;
