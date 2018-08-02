import React, { Component } from 'react'
import ReactTimeout from 'react-timeout'
import Select from 'react-select'
import { connect } from 'react-redux'
import * as Animated from 'react-select/lib/animated';
import { withRouter } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { mixpanel } from '~/mixpanel'
import hashToHex from '~/utils/hash-to-hex'
import { isNotEmptyString } from '~/utils/common-util'
import { uploadJson, downloadJson } from '~/utils/storage-util'
import { isBlank } from '~/utils/isBlank'
import { TransactionStateHandler } from '~/saga-genesis/TransactionStateHandler'
import { withSend } from '~/saga-genesis'
import { customStyles } from '~/config/react-select-custom-styles'
import { groupedRecommendationOptions } from './recommendationOptions'
import { groupedDiagnosisOptions } from './diagnosisOptions'
import { HippoCheckboxGroup } from '~/components/forms/HippoCheckboxGroup'
import { HippoTextArea } from '~/components/forms/HippoTextArea'
import { HippoToggleButtonGroup } from '~/components/forms/HippoToggleButtonGroup'
// import { HippoTextInput } from '~/components/forms/HippoTextInput'
import { Loading } from '~/components/Loading'
import { toastr } from '~/toastr'
import * as routes from '~/config/routes'
import pull from 'lodash.pull'

function mapStateToProps (state, ownProps) {
  return {
    transactions: state.sagaGenesis.transactions
  }
}

const requiredFields = [
  'diagnosis'
]
// These fields are dynamically added as required depending on choices the user makes:
// 'pregnant' => female only

export const SubmitDiagnosisContainer = withRouter(ReactTimeout(connect(mapStateToProps)(withSend(class _SubmitDiagnosisContainer extends Component {
  static propTypes = {
    caseAddress: PropTypes.string,
    caseKey: PropTypes.any,
    diagnosisHash: PropTypes.string
  }

  constructor(props, context){
    super(props, context)

    this.state = {
      overTheCounterUse: null,
      overTheCounterMedication: [],
      overTheCounterNotes: '',
      overTheCounterFrequency: '',
      overTheCounterDuration: '',
      overTheCounterRecommendation: null,

      // topicalMedicationsRecommendation: [],
      // oralMedicationsRecommendation: [],
      // proceduresRecommendation: [],
      // otherRecommendation: [],

      personalMessage: '',

      isChallenge: false,
      originalDiagnosis: null,

      diagnosis: null,

      formIsValid: false,
      showConfirmationModal: false,

      isSubmitting: false,
      errors: []
    }
  }

  componentDidMount () {
    this.init(this.props)
  }

  componentWillReceiveProps(props) {
    this.init(props)
    const transaction = props.transactions[this.state.transactionId]
    if (this.state.transactionHandler) {
      this.state.transactionHandler.handle(transaction)
        .onError((error) => {
          toastr.transactionError(error)
          this.setState({
            transactionHandler: null,
            isSubmitting: false
          })
        })
        .onReceipt(() => {
          this.setState({
            transactionHandler: null,
            isSubmitting: false
          })
        })
        .onTxHash(() => {
          this.setState({
            transactionHandler: null,
            isSubmitting: false
          })
          toastr.success("Thank You - Your diagnosis was received successfully, and we're sending your diagnosis to the patient.")
          this.props.setTimeout(() => {
            this.props.history.push(routes.DOCTORS_CASES_OPEN)
          }, 1000)
        })
    }
  }

  init (props) {
    if (this.state.originalDiagnosis || !props.diagnosisHash || !props.caseKey) { return }

    try {
      downloadJson(props.diagnosisHash, props.caseKey).then((originalDiagnosis) => {
        this.setState({
          originalDiagnosis: JSON.parse(originalDiagnosis)
        })
      })
    } catch (error) {
      toastr.error('There was an error while downloading your case details from IPFS.')
      console.error(error)
    }
  }

  handleCheckboxGroupOnChange = (event) => {
    let currentValues = this.state[event.target.name]

    if (currentValues.includes(event.target.value)) {
      pull(currentValues, event.target.value)
    } else {
      currentValues.push(event.target.value)
    }

    this.setState({ [event.target.name]: currentValues })
  }

  // handleTextInputOnChange = (event) => {
  //   this.setState({ [event.target.id]: event.target.value })
  // }

  // handleTextInputOnBlur = (event) => {
  //   this.validateField(event.target.id)
  // }

  handleButtonGroupOnChange = (event) => {
    this.setState({ [event.target.name]: event.target.value }, () => {
      this.validateField(event.target.name)
      this.buildFinalRecommendation()
    })
  }

  handleTextAreaOnChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value
    }, this.buildFinalRecommendation)
  }

  handleTextAreaOnBlur = (event) => {
    this.validateField(event.target.id)
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

  recommendationSelectUpdated = (key) => {
    return (newValue) => {
      this.setState({
        [key]: newValue.map(option => option.value)
      }, this.buildFinalRecommendation)
    }
  }

  // This is the diagnosis chosen in the 'react-select' <Select> components
  updateDiagnosis = (newValue) => {
    this.setState({ diagnosis: newValue.value }, this.validateInputs)
  }

  // Combines the selected overTheCounterRecommendation values into a string
  buildFinalRecommendation = () => {
    let overTheCounterRecommendation = <React.Fragment>
      <strong>{this.state.overTheCounterMedication.join(', ')}</strong>
      <br />
      {this.state.overTheCounterUse} {this.state.overTheCounterFrequency} for {this.state.overTheCounterDuration}
      <br />
      {this.state.overTheCounterNotes}
    </React.Fragment>

    this.setState({ overTheCounterRecommendation }, this.validateInputs)
  }

  validateInputs = () => {
    const valid =
      isNotEmptyString(this.state.diagnosis) &&
      isNotEmptyString(this.state.overTheCounterRecommendation)

    this.setState({ formIsValid: valid })
  }

  handleSubmit = async (event) => {
    event.preventDefault()

    await this.runValidation()

    console.log('formIsValid! ', this.state.formIsValid)

    if (this.state.errors.length === 0) {
      this.setState({
        showConfirmationModal: true
      })
    }
  }

  handleCancelConfirmSubmissionModal = (event) => {
    this.setState({ showConfirmationModal: false })
  }

  submitDiagnosis = async () => {
    this.setState({
      isSubmitting: true,
      showConfirmationModal: false
    })

    const diagnosisInformation = {
      diagnosis: this.state.diagnosis,
      overTheCounterRecommendation: this.state.overTheCounterRecommendation,
      personalMessage: this.state.personalMessage
    }
    const diagnosisJson = JSON.stringify(diagnosisInformation)
    const ipfsHash = await uploadJson(diagnosisJson, this.props.caseKey)
    const hashHex = '0x' + hashToHex(ipfsHash)

    let transactionId
    if(!isBlank(this.props.diagnosisHash)) {
      const accept = this.state.originalDiagnosis.diagnosis === this.state.diagnosis
      transactionId = this.props.send(this.props.caseAddress, 'diagnoseChallengedCase', hashHex, accept)()
      mixpanel.track('Submit Challenged Case Diagnosis')
    } else {
      transactionId = this.props.send(this.props.caseAddress, 'diagnoseCase', hashHex)()
      mixpanel.track('Submit Case Diagnosis')
    }
    this.setState({
      transactionId,
      transactionHandler: new TransactionStateHandler(),
      showConfirmationModal: false
    })
  }

  errorMessage = (fieldName) => {
    let msg

    msg = 'must be filled out'

    return msg
  }

  render() {
    const loading = this.state.isSubmitting

    let errors = {}
    for (var i = 0; i < this.state.errors.length; i++) {
      let fieldName = this.state.errors[i]

      errors[fieldName] =
        <p key={`errors-${i}`} className='has-error help-block small'>
          {this.errorMessage(fieldName)}
        </p>
    }

    return (
      <div>
        <div className="card">
          <form onSubmit={this.handleSubmit} >
            <div id="submit-diagnosis" className="card-header">
              <h3 className="card-title">
                Submit Diagnosis
                <br /><small><a className="link--internal" href="#view-case-details">View Case Details</a></small>
              </h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xs-12 col-md-8">
                  <div className="form-group" id="diagnosis">
                    <label>Diagnosis<span className='star'>*</span></label>
                    <Select
                      placeholder="--- Choose a diagnosis ---"
                      styles={customStyles}
                      components={Animated}
                      closeMenuOnSelect={true}
                      options={groupedDiagnosisOptions}
                      onChange={this.updateDiagnosis}
                      required
                    />
                    {errors['diagnosis']}
                  </div>

                  <div className="form-group form-group--logical-grouping">
                    <label>Over-the-Counter Medication</label>

                    <div className={classnames('form-group', { 'has-error': errors['overTheCounterMedication'] })}>
                      <Select
                        placeholder={groupedRecommendationOptions.overTheCounter.label}
                        styles={customStyles}
                        components={Animated}
                        closeMenuOnSelect={true}
                        options={groupedRecommendationOptions.overTheCounter.options}
                        isMulti={true}
                        onChange={this.recommendationSelectUpdated('overTheCounterMedication')}
                        selected={this.state.overTheCounterMedication}
                        required
                      />
                      {errors['overTheCounterMedication']}
                    </div>

                    <HippoToggleButtonGroup
                      id='overTheCounterUse'
                      name='overTheCounterUse'
                      colClasses='col-xs-12'
                      label=''
                      formGroupClassNames=''
                      error={errors['overTheCounterUse']}
                      buttonGroupOnChange={this.handleButtonGroupOnChange}
                      values={['Apply', 'Wash', 'Take by mouth']}
                    />

                    <div className="row">
                      <HippoTextArea
                        id='overTheCounterFrequency'
                        name="overTheCounterFrequency"
                        rowClasses=''
                        colClasses='col-xs-6'
                        label='Frequency'
                        error={errors['overTheCounterFrequency']}
                        textAreaOnBlur={this.handleTextAreaOnBlur}
                        textAreaOnChange={this.handleTextAreaOnChange}
                      />

                      <HippoTextArea
                        id='overTheCounterDuration'
                        name="overTheCounterDuration"
                        rowClasses=''
                        colClasses='col-xs-6'
                        label='Duration'
                        error={errors['overTheCounterDuration']}
                        textAreaOnBlur={this.handleTextAreaOnBlur}
                        textAreaOnChange={this.handleTextAreaOnChange}
                      />
                    </div>

                    <HippoTextArea
                      id='overTheCounterNotes'
                      name="overTheCounterNotes"
                      colClasses='col-xs-12'
                      label='Notes'
                      optional={true}
                      error={errors['overTheCounterNotes']}
                      textAreaOnBlur={this.handleTextAreaOnBlur}
                      textAreaOnChange={this.handleTextAreaOnChange}
                    />
                  </div>

                  <HippoTextArea
                    id='sideEffects'
                    name='sideEffects'
                    colClasses='col-xs-12 col-sm-12 col-md-12'
                    label='Side Effects'
                    optional={true}
                    error={errors['sideEffects']}
                    textAreaOnBlur={this.handleTextAreaOnBlur}
                    textAreaOnChange={this.handleTextAreaOnChange}
                  />
                  <HippoTextArea
                    id='sideEffectsAdditional'
                    name='sideEffectsAdditional'
                    colClasses='col-xs-12 col-sm-12 col-md-12'
                    label='Additional Side Effects'
                    optional={true}
                    error={errors['sideEffectsAdditional']}
                    textAreaOnBlur={this.handleTextAreaOnBlur}
                    textAreaOnChange={this.handleTextAreaOnChange}
                  />

                  <HippoTextArea
                    id='personalMessage'
                    name='personalMessage'
                    colClasses='col-xs-12 col-sm-12 col-md-12'
                    label='Personal Message'
                    optional={true}
                    textAreaOnBlur={this.handleTextAreaOnBlur}
                    textAreaOnChange={this.handleTextAreaOnChange}
                  />
                </div>

                <div className="col-xs-12 col-md-4">
                  <div className="well">
                    <label className="text-gray">Your diagnosis:</label>
                    <p>
                      {(this.state.diagnosis !== null)
                        ? this.state.diagnosis
                        : 'no diagnosis entered.'}
                    </p>


                    <label className="text-gray">Over the Counter Medication:</label>
                    <p>
                      {(this.state.overTheCounterRecommendation !== null)
                        ? this.state.overTheCounterRecommendation
                        : 'no overTheCounterRecommendation entered.'}
                    </p>

                    {(this.state.personalMessage)
                      ? (
                          <div>
                            <label className="text-gray">Personal Message:</label>
                            <p>
                              {this.state.personalMessage}
                            </p>
                          </div>
                        )
                      : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer text-right">
              <button
                disabled={loading}
                type="submit"
                className="btn btn-lg btn-success"
              >
                Submit Diagnosis
              </button>
            </div>
          </form>
        </div>

        <Modal show={this.state.showConfirmationModal}>
          <Modal.Body>
            <div className="row">
              <div className="col-xs-12 text-center">
                <h4>
                  Are you sure?
                </h4>
                <h5>
                  This will send your diagnosis and overTheCounterRecommendation to the patient.
                </h5>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              onClick={this.handleCancelConfirmSubmissionModal}
              type="button"
              className="btn btn-link">
              No
            </button>
            <button
              onClick={this.submitDiagnosis}
              type="button"
              className="btn btn-primary"
              disabled={loading}>
              Yes
            </button>
          </Modal.Footer>
        </Modal>

        <Loading loading={loading} />
      </div>
    )
  }
}))))
