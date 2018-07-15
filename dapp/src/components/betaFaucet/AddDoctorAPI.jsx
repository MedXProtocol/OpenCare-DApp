import React, { Component } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios';
import { LoadingLines } from '~/components/LoadingLines'

export const AddDoctorAPI = class extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isSending: false,
      errorMessage: '',
      response: {},
      name: ''
    }
  }

  handleRegisterDoctor = (event) => {
    event.preventDefault()
    this.setState({
      isSending: true,
      errorMessage: '',
      response: {}
    }, this.doAddDoctor)
  }

  doAddDoctor = async () => {
    const faucetLambdaURI = `${process.env.REACT_APP_LAMBDA_BETA_FAUCET_ENDPOINT_URI}/addOrReactivateDoctor`

    try {
      const response = await axios.get(`${faucetLambdaURI}?ethAddress=${this.props.address}&name=${this.state.name}`)

      if (response.status === 200) {
        this.setState({
          responseMessage: "You will soon be registered as a Doctor",
          txHash: response.data.txHash,
          isSending: false,
          name: ''
        })

        this.props.moveToNextStep({ withDelay: true })
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
          There was an error while upgrading your account to be a Doctor, you may already be registered as a Doctor. If the problem persists please contact MedCredits on Telegram and we can send you Ropsten Testnet MedX:
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
      <div className="well">
        <LoadingLines visible={isSending} /> &nbsp;
        {successParagraph}
        {errorParagraph}
      </div>
    )

    return (
      <div className="col-xs-12 text-center">
        <strong>Become a Doctor:</strong>
        <p>
          During the beta you can opt to become a
          <br />Doctor and diagnose patient cases.
        </p>
        <br />
        <div className="col-xs-12 col-sm-8 col-sm-offset-2">
          <div className="form-group">
            <label htmlFor="name">Your Doctor Name:</label>
            <input
              className="form-control"
              value={this.state.name}
              placeholder='Dr. Kim Wexler'
              onChange={(e) => this.setState({name: e.target.value})}
              id="name"
              required
            />
          </div>
        </div>
        <p>
          <a
            disabled={isSending}
            onClick={this.handleRegisterDoctor}
            className="btn btn-lg btn-primary"
          >{isSending ? 'Registering ...' : 'Register As Doctor'}</a>
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

AddDoctorAPI.propTypes = {
  address: PropTypes.string
}
