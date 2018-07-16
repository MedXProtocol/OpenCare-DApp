import React, { Component } from 'react'
import ReactTimeout from 'react-timeout'
import { EthAddress } from '~/components/EthAddress'
import PropTypes from 'prop-types'
import axios from 'axios';
import { LoadingLines } from '~/components/LoadingLines'
import medXLogoImg from '~/assets/img/medx-logo.png'
import medXLogoImg2x from '~/assets/img/medx-logo@2x.png'
import { toMedX } from '~/utils/toMedX'

export const MedXFaucetAPI = ReactTimeout(class extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isSending: false,
      errorMessage: '',
      response: {}
    }
  }

  handleSendMedX = (e) => {
    e.preventDefault()
    this.setState({
      isSending: true,
      errorMessage: '',
      response: {}
    }, this.doSendMedX)
  }

  doSendMedX = async () => {
    const faucetLambdaURI = `${process.env.REACT_APP_LAMBDA_BETA_FAUCET_ENDPOINT_URI}/betaFaucetSendMedX`

    try {
      const response = await axios.get(`${faucetLambdaURI}?ethAddress=${this.props.address}`)

      if (response.status === 200) {
        this.setState({
          responseMessage: "15 MedX is on the way",
          txHash: response.data.txHash
        })

        this.props.moveToNextStep({ withDelay: true })
      } else {
        this.setState({
          responseMessage: '',
          errorMessage: `There was an error: ${response.data}`
        })
        this.props.setTimeout(() => {
          this.setState({
            isSending: false
          })
        }, 1000)
      }
    } catch (error) {
      this.setState({
        responseMessage: '',
        errorMessage: error.message
      })
      this.props.setTimeout(() => {
        this.setState({
          isSending: false
        })
      }, 1000)
    }
  }

  render () {
    const { isSending, responseMessage, errorMessage } = this.state

    if (errorMessage) {
      var englishErrorMessage = (
        <small>
          <br />
          There was an error while sending you MedX, you may have already received it or it's on the way. If the problem persists please contact MedCredits on Telegram and we can send you Ropsten Testnet MedX:
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
        </p>
      )
    }

    const responseWell = (
      <div className="well beta-faucet--well">
        <br />
        <LoadingLines visible={isSending} /> &nbsp;
        <br />
        {successParagraph}
        {errorParagraph}
      </div>
    )

    return (
      <div className="col-xs-12 text-center">
        <strong>Current MedX Balance:</strong>
        <h2 className="header--no-top-margin">
          {toMedX(this.props.medXBalance)}
          <img
            src={medXLogoImg}
            alt="MedX Logo"
            srcSet={`${medXLogoImg} 1x, ${medXLogoImg2x} 2x`}
          />
        </h2>
        <p className="small text-center">
          <span className="eth-address text-gray">For address:&nbsp;
            <EthAddress address={this.props.address} />
          </span>
        </p>
        <hr />
        <p>
          To submit a case to a doctor you will need MedX.
          <br />We can send you 15 MedX to get started:
        </p>
        <p>
          <a
            disabled={isSending}
            onClick={this.handleSendMedX}
            className="btn btn-lg btn-primary"
          >{isSending ? 'Sending ...' : 'Send Me MedX'}</a>
        </p>
        {isSending || responseMessage || errorMessage ? responseWell : ''}
        <p>
          <br />
          <a onClick={this.props.handleMoveToNextStep}>skip this for now</a>
        </p>
      </div>
    )
  }
})

MedXFaucetAPI.propTypes = {
  medXBalance: PropTypes.string,
  address: PropTypes.string
}
