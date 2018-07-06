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
      response: {},
      paydate: 0,
      successDate: 0,
      blacklisted: false
    }
  }

  handleSendEther = (event) => {
    event.preventDefault()
    this.setState({
      isSending: true,
      errorMessage: '',
      response: {},
      paydate: 0,
      successDate: 0,
      blacklisted: false
    }, this.doSendEther)
  }

  // will return:
  // {
  //   "paydate": 0,
  //   "message": "you are greylisted",
  //   ...
  // }
  // or 200:
  // {
  //  "paydate":1530796071,
  //  "amount":1000000000000000000,
  //  ...
  //}
  doSendEther = async () => {
    const faucetLambdaURI = `${process.env.REACT_APP_LAMBDA_BETA_FAUCET_ENDPOINT_URI}/betaFaucetDripProxy`

    try {
      const response = await axios.get(`${faucetLambdaURI}?ethAddress=${this.props.address}`)

      if (response.status === 200 && response.data.paydate > 0) {
        this.setState({
          responseMessage: "1 Ether is on it's way!",
          successDate: Date.now(),
          payDate: response.data.paydate,
          isSending: false
        })
      } else if (response.data.message === 'you are greylisted' || response.data.message === 'you are blacklisted') {
        this.setState({
          responseMessage: '',
          errorMessage: '1 Ether has already been sent to your address. It may take a couple of minutes to arrive.',
          blacklisted: true,
          isSending: false
        })
      }
    } catch (error) {
      console.error(error);
      this.setState({
        responseMessage: '',
        errorMessage: error.message,
        isSending: false
      })
    }
  }

  render () {
    const { isSending, responseMessage, payDate, successDate, errorMessage, blacklisted } = this.state

    if (payDate > 0)
      var payDateMessage = `Transaction will be sent in ${new Date((payDate - successDate)).getSeconds()} seconds, and may take a minute or two to confirm`

    if (errorMessage && !blacklisted) {
      var queueFullMessage = (
        <small>
          <br />
          The queue may be full, please wait a minute and try again. If the problem persists please contact MedCredits on Telegram and we can send you Ropsten Testnet Ether:
          &nbsp; <a
            target="_blank"
            href="https://t.me/MedCredits"
            rel="noopener noreferrer">Contact Support</a>
        </small>
      )
    }
    if (errorMessage) {
      var errorParagraph = (
        <p className="text-danger">
          {errorMessage}
          {queueFullMessage}
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
            {payDateMessage}
          </small>
        </p>
      )
    }

    const responseWell = (
      <div className="well">
        <LoadingLines visible={isSending || payDate} /> &nbsp;
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
            disabled={isSending || payDate}
            onClick={this.handleSendEther}
            className="btn btn-lg btn-primary"
          >{isSending || payDate ? 'Sending ...' : 'Send Me Ether'}</a>
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
