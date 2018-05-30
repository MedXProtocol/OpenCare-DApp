import React, { Component } from 'react';
import Spinner from '../../../components/Spinner';
import { mintMedXTokens } from '../../../utils/web3-util';
import get from 'lodash.get'
import defined from '@/utils/defined'
import { connect } from 'react-redux'
import { withContractRegistry, withSend } from '@/saga-genesis'
import { contractByName } from '@/saga-genesis/state-finders'

function mapStateToProps (state) {
  let account = get(state, 'sagaGenesis.accounts[0]')
  let MedXToken = contractByName(state, 'MedXToken')
  return {
    account,
    transactions: state.sagaGenesis.transactions,
    MedXToken
  }
}

const MintTokens = withContractRegistry(connect(mapStateToProps)(withSend(class _MintTokens extends Component {
    constructor(props){
        super(props)
        this.state = {
            address: props.account || '',
            error: null,
            submitInProgress: false
        };
    }

    componentWillReceiveProps (props) {
      if (!this.props.account && props.account)
      this.setState({
        address: props.account
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
      const { send, MedXToken } = this.props
      const transactionId = send(MedXToken, 'mint', this.state.address, 1000)()
      this.setState({transactionId})
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
})))

export default MintTokens
