import React, { Component } from 'react'
import getWeb3 from '~/get-web3'
import get from 'lodash.get'
import { connect } from 'react-redux'
import { contractByName, withContractRegistry, withSend } from '~/saga-genesis'
import {
  FormGroup,
  ControlLabel,
  FormControl
} from 'react-bootstrap'

function mapStateToProps (state) {
  let account = get(state, 'sagaGenesis.accounts[0]')
  let MedXToken = contractByName(state, 'MedXToken')
  return {
    account,
    transactions: state.sagaGenesis.transactions,
    MedXToken
  }
}

export const MintTokensContainer = withContractRegistry(connect(mapStateToProps)(withSend(class _MintTokens extends Component {
    constructor(props){
      super(props)
      this.state = {
        address: props.account || ''
      }
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
      const transactionId = send(MedXToken, 'mint', this.state.address, getWeb3().utils.toWei('100000', 'ether'))()
      this.setState({transactionId})
    }

    render() {
      return (
        <div className='container'>
          <div className='row'>
            <div className="col-sm-6 col-sm-offset-3">
              <div className="card">
                <div className="card-header">
                  <h3 className="title card-title">
                    Mint Tokens
                  </h3>
                </div>
                <div className="card-body">
                  <div className="form-wrapper">
                    <form onSubmit={this.handleSubmit}>
                      <FormGroup>
                        <ControlLabel>Account Address</ControlLabel>
                        <FormControl
                          className="form-control"
                          id="hash"
                          placeholder="0x00000000000000000000000"
                          onChange={this.updateAddress}
                          required />
                      </FormGroup>
                      <div className="text-right">
                        <button
                          type="submit"
                          className="btn btn-lg btn-success">Mint Tokens</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
})))
