import React, { Component } from 'react'
import { EthAddress } from '~/components/EthAddress'
import PropTypes from 'prop-types'
import axios from 'axios';
import { LoadingLines } from '~/components/LoadingLines'

export const EthFaucetAPI = class extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isSending: false,
      errorMessage: '',
      response: {}
    }
  }

  handleSendEther = (event) => {
    event.preventDefault()
    this.setState({
      isSending: true,
      errorMessage: '',
      response: {}
    }, this.doSendEther)
  }

  doSendEther = async () => {
    const faucetLambdaURI = `${process.env.REACT_APP_LAMBDA_BETA_FAUCET_ENDPOINT_URI}/betaFaucetSendEther`

    try {
      const response = await axios.get(`${faucetLambdaURI}?ethAddress=${this.props.address}`)

      if (response.status === 200) {
        this.setState({
          responseMessage: "We're sending you Ether",
          txHash: response.data.txHash
        })
      } else {
        this.setState({
          responseMessage: '',
          errorMessage: `There was an error: ${response.data}`,
          isSending: false
        })
      }
    } catch (error) {
      this.setState({
        responseMessage: '',
        errorMessage: error.message,
        isSending: false
      })
    }
  }

  render () {
    const { isSending, responseMessage, errorMessage } = this.state

    if (errorMessage) {
      var englishErrorMessage = (
        <small>
          <br />
          There was an error while sending you Ether, you may have already received it or it's on the way. If the problem persists please contact MedCredits on Telegram and we can send you Ropsten Testnet Ether:
          &nbsp; <a
            target="_blank"
            href="https://t.me/MedCredits"
            rel="noopener noreferrer">Contact Support</a>
        </small>
      )

      var errorParagraph = (
        <p className="text-danger">
          {errorMessage}
          {englishErrorMessage}
          <br />
          <br />
        </p>
      )
    }

    if (responseMessage) {
      var successParagraph = (
        <p>
          <strong>{responseMessage}</strong>
          <small>
            <br/>
            Please wait, this may take up to a couple of minutes ...
          </small>
          <br/>
          <br/>
        </p>
      )
    }

    const responseWell = (
      <div className="well">
        <LoadingLines visible={isSending} /> &nbsp;
        {successParagraph}
        {errorParagraph}
      </div>
    )

    return (
      <div>
        <strong>Current Balance:</strong>
        <h2 className="header--no-top-margin">
          {this.props.ethBalance} Ξ
        </h2>
        <p className="small text-center">
          <span className="eth-address text-gray">For address:&nbsp;
            <EthAddress address={this.props.address} />
          </span>
        </p>
        <hr />
        <p>
          You're low on ether, which is necessary to use Hippocrates.
          <br />Not to worry! We can have some sent to your account:
        </p>
        <p>
          <a
            disabled={isSending}
            onClick={this.handleSendEther}
            className="btn btn-lg btn-primary"
          >{isSending ? 'Sending ...' : 'Send Me Ether'}</a>
          <br />
          <br />
          <a onClick={this.props.moveToNextStep}>skip this for now</a>
        </p>
        <br />
        {isSending || responseMessage || errorMessage ? responseWell : ''}
      </div>
    )
  }
}

EthFaucetAPI.propTypes = {
  ethBalance: PropTypes.number,
  address: PropTypes.string
}
