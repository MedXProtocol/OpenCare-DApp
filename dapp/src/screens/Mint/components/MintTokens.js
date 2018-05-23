import React, { Component } from 'react';
import Spinner from '../../../components/Spinner';
import { mintMedXTokens } from '../../../utils/web3-util';
import get from 'lodash.get'
import defined from '@/utils/defined'
import dispatch from '@/dispatch'

class MintTokens extends Component {
    constructor(props){
        super(props)
        this.state = {
            address: get(this.props, 'accounts[0]', ''),
            error: null,
            submitInProgress: false
        };
        dispatch({ type: 'PUSH_TO_TXSTACK' })
    }

    componentWillReceiveProps (props) {
      if (!this.props.accounts[0] && props.accounts[0])
      this.setState({
        address: props.accounts[0]
      })
    }

    updateAddress = (event) => {
        this.setState({address: event.target.value});
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.mintTokens();
    }

    mintTokens = () => {
      const stackId = this.props.MedXToken.mint.cacheSend(this.state.address, 1000)
      this.setState({stackId})
    }

    onSuccess = () => {
        this.setState({submitInProgress: false});
    }

    onError = (error) => {
        this.setState({error: error});
        this.setState({submitInProgress: false});
    }

    render() {
      var minting = false
      if (defined(this.state.stackId)) {
        const txHash = this.props.transactionStack[this.state.stackId]
        minting = true
        if (defined(txHash)) {
          var transactionStatus = this.props.transactions[txHash].status
          if (transactionStatus === 'success') {
            minting = false
          }
        }
      }

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
                        <button
                          type="submit"
                          className="btn btn-default"
                          disabled={minting}>Mint Tokens</button>
                    </div>
                </form>
                <Spinner loading={minting}/>
            </div>
        );
    }
}

export default MintTokens
