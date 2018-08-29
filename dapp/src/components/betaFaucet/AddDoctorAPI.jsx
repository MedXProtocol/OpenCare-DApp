import React, { Component } from 'react'
import ReactTimeout from 'react-timeout'
import PropTypes from 'prop-types'
import { axiosInstance } from '~/config/hippoAxios'
import { LoadingLines } from '~/components/LoadingLines'
import { connect } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import { currentAccount } from '~/services/sign-in'
import classnames from 'classnames'
import Select from 'react-select'
import * as Animated from 'react-select/lib/animated';
import { customStyles } from '~/config/react-select-custom-styles'
import { isNotEmptyString } from '~/utils/isNotEmptyString'
import { countries } from '~/lib/countries'
import { regions } from '~/lib/regions'
import pull from 'lodash.pull'

function mapStateToProps(state) {
  const account = currentAccount()
  return {
    account
  }
}


const requiredFields = [
  'name',
  'country'
]
// These fields are dynamically added as required depending on choices the user makes:
// 'region' => USA / Canada only

export const AddDoctorAPI = ReactTimeout(
  connect(mapStateToProps)(
    class _AddDoctorAPI extends Component {

      constructor(props) {
        super(props)

        this.state = {
          isSending: false,
          errorMessage: '',
          response: {},
          name: '',
          country: '',
          region: '',
          errors: [],
          regionOptions: [],
        }

        this.setRegionRef = element => { this.regionInput = element }
      }

      handleSubmit = async (event) => {
        event.preventDefault()

        await this.runValidation()

        if (this.state.errors.length === 0) {
          this.setState({
            isSending: true,
            errorMessage: '',
            response: {}
          }, this.doAddDoctor)
        }
      }

      doAddDoctor = async () => {
        const faucetLambdaURI = `${process.env.REACT_APP_LAMBDA_BETA_FAUCET_ENDPOINT_URI}/addOrReactivateDoctor`
        const publicKey = '0x' + this.props.account.hexPublicKey()
        const url = `${faucetLambdaURI}?ethAddress=${this.props.address}&name=${this.state.name}&publicKey=${publicKey}&country=${this.state.country}&region=${this.state.region}`

        try {
          const response = await axiosInstance.get(url)

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

      validateField = (fieldName) => {
        if (!requiredFields.includes(fieldName)) {
          return
        }

        const errors = this.state.errors

        if (!isNotEmptyString(this.state[fieldName])) {
          errors.push(fieldName)
        } else {
          pull(errors, fieldName)
        }

        this.setState({ errors: errors })
      }

      runValidation = async () => {
        // reset error states
        await this.setState({ errors: [] })

        let errors = []
        let length = requiredFields.length

        for (var fieldIndex = 0; fieldIndex < length; fieldIndex++) {
          let fieldName = requiredFields[fieldIndex]
          if (!isNotEmptyString(this.state[fieldName])) {
            errors.push(fieldName)
          }
        }

        await this.setState({ errors: errors })

        if (errors.length > 0) {
          // First reset it so it will still take the user to the anchor even if
          // we already took them there before (still error on same field)
          window.location.hash = `#`;

          // Go to first error field
          window.location.hash = `#${errors[0]}`;
        }
      }

      handleCountryChange = (newValue) => {
        this.setState({ country: newValue.value }, this.checkCountry)
      }

      checkCountry = () => {
        this.validateField('country')

        if (this.isCanadaOrUSA()) {
          requiredFields.push('region')
        } else {
          pull(requiredFields, 'region')

          this.setState({ region: '' })
          this.regionInput.select.clearValue()
        }

        this.setState({ regionOptions: this.isCanadaOrUSA() ? regions[this.state.country] : [] })
      }

      handleRegionChange = (newValue) => {
        this.setState({ region: newValue ? newValue.value : '' }, () => {
          if (this.isCanadaOrUSA()) {
            this.validateField('region')
          }
        })
      }

      errorMessage = (fieldName) => {
        let msg
        if (fieldName === 'country' || fieldName === 'region') {
          msg = 'must be chosen'
        } else {
          msg = 'must be filled out'
        }
        return msg
      }

      isCanadaOrUSA = () => {
        return this.state.country === 'US' || this.state.country === 'CA'
      }

      render () {
        const { isSending, responseMessage, errorMessage } = this.state

        let errors = {}
        for (var i = 0; i < this.state.errors.length; i++) {
          let fieldName = this.state.errors[i]

          errors[fieldName] =
            <p key={`errors-${i}`} className='has-error help-block small'>
              {this.errorMessage(fieldName)}
            </p>
        }

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
          <div className="col-xs-12">
            <div className="text-center">
              <strong>Would you like to Diagnose Cases?</strong>
              <p>
                During this version of the beta you can opt to become a
                <br />Doctor and diagnose patient cases.
              </p>
            </div>
            <form onSubmit={this.handleSubmit}>
              <div className="col-xs-12 col-sm-8 col-sm-offset-2">
                <div className={classnames('form-group', { 'has-error': errors['name'] })}>
                  <label htmlFor="name">Your Doctor Name</label>
                  <input
                    className="form-control"
                    value={this.state.name}
                    placeholder='Dr. Hibbert'
                    onChange={(e) => this.setState({name: e.target.value})}
                    id="name"
                  />
                  {errors['name']}
                </div>

                <div className={classnames('form-group', { 'has-error': errors['country'] })}>
                  <label htmlFor="name">Your Country</label>
                  <Select
                    placeholder="Please select a Country"
                    styles={customStyles}
                    components={Animated}
                    closeMenuOnSelect={true}
                    options={countries}
                    onChange={this.handleCountryChange}
                    selected={this.state.country}
                    required
                  />
                  {errors['country']}
                </div>

                <div className={classnames('form-group', { 'has-error': errors['region'] })}>
                  <label htmlFor="name">Your Region</label>
                  <span data-tip='' data-for='region-explanation'>
                    <Select
                      isDisabled={!this.isCanadaOrUSA()}
                      placeholder="Please select a Region"
                      styles={customStyles}
                      components={Animated}
                      closeMenuOnSelect={true}
                      ref={this.setRegionRef}
                      options={this.state.regionOptions}
                      onChange={this.handleRegionChange}
                      selected={this.state.region}
                    />
                  </span>
                  <ReactTooltip
                    id='region-explanation'
                    effect='solid'
                    place='top'
                    html={true}
                    getContent={() => !this.isCanadaOrUSA() ? 'Region only necessary for Canada and USA' : '' }
                  />

                  {errors['region']}
                </div>
              </div>

              <div className="text-center">
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
              </div>
            </form>
          </div>
        )
      }
    }
  )
)

AddDoctorAPI.propTypes = {
  address: PropTypes.string
}
