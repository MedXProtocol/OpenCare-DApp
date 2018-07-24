import React, { Component } from 'react'
import ReactTimeout from 'react-timeout'
import PropTypes from 'prop-types'
import { axiosInstance } from '~/config/hippoAxios'
import { LoadingLines } from '~/components/LoadingLines'

export const AddDoctorAPI = ReactTimeout(class _AddDoctorAPI extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isSending: false,
      errorMessage: '',
      response: {},
      name: ''
    }
  }

  handleSubmit = (event) => {
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
      const response = await axiosInstance.get(`${faucetLambdaURI}?ethAddress=${this.props.address}&name=${this.state.name}`)

      if (response.status === 200) {
        this.setState({
          responseMessage: "You will soon be registered as a Doctor",
          txHash: response.data.txHash
        })
        this.props.addExternalTransaction('addDoctor', response.data.txHash)
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
          There was an error while upgrading your account to be a Doctor, you may already be registered as a Doctor. If the problem persists please contact MedCredits on Telegram and we can send you Ropsten Testnet MEDX:
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
        <strong>Would you like to Diagnose Cases?</strong>
        <p>
          During the beta you can opt to become a
          <br />Doctor and diagnose patient cases.
        </p>
        <br />
        <form onSubmit={this.handleSubmit}>
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
            <button
              type="input"
              disabled={isSending}
              className="btn btn-lg btn-primary"
            >
              {isSending ? 'Registering ...' : 'Register As Doctor'}
            </button>
          </p>
          {isSending || responseMessage || errorMessage ? responseWell : ''}
          <p>
            <br />
            <a onClick={this.props.handleMoveToNextStep}>skip this for now</a>
          </p>
        </form>
      </div>
    )
  }
})

AddDoctorAPI.propTypes = {
  address: PropTypes.string
}
