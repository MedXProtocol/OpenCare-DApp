import ReactDOMServer from 'react-dom/server'
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
import { HippoStringDisplay } from '~/components/HippoStringDisplay'
import { HippoTextArea } from '~/components/forms/HippoTextArea'
import { HippoToggleButtonGroup } from '~/components/forms/HippoToggleButtonGroup'
import { InfoQuestionMark } from '~/components/InfoQuestionMark'
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
      overTheCounterRecommendation: '',

      prescriptionUse: null,
      prescriptionMedication: [],
      prescriptionNotes: '',
      prescriptionFrequency: '',
      prescriptionDuration: '',
      prescriptionRecommendation: '',

      sideEffects: '',
      sideEffectsAdditional: '',

      counseling: '',
      counselingAdditional: '',

      personalMessage: '',

      isChallenge: false,
      originalDiagnosis: null,

      diagnosis: null,

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

  // Combines the selected overTheCounter* and prescription* values into their
  // respective React groups
  buildFinalRecommendation = () => {
    this.buildRecommendation('overTheCounter')
    this.buildRecommendation('prescription')
  }

  buildRecommendation = (fieldGroup) => {
    let recommendation = ''
    let duration = ''

    if (this.state[`${fieldGroup}Medication`].length > 0) {
      if (this.state[`${fieldGroup}Duration`]) {
        duration = `for ${this.state[`${fieldGroup}Duration`]}`
      }
      recommendation = <React.Fragment>
        <strong>{this.state[`${fieldGroup}Medication`].join(', ')}</strong>
        <br />
        {this.state[`${fieldGroup}Use`]} {this.state[`${fieldGroup}Frequency`]} {duration}
        <br />
        {this.state[`${fieldGroup}Notes`]}
      </React.Fragment>
      recommendation = ReactDOMServer.renderToStaticMarkup(recommendation)
    }

    this.setState({ [`${fieldGroup}Recommendation`]: recommendation }, this.validateInputs)
  }

  handleSubmit = async (event) => {
    event.preventDefault()

    await this.runValidation()

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
      overTheCounterRecommendation,
      prescriptionRecommendation,
      sideEffects: this.state.sideEffects,
      sideEffectsAdditional: this.state.sideEffectsAdditional,
      counseling: this.state.counseling,
      counselingAdditional: this.state.counselingAdditional,
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
                Send Diagnosis
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

                  <div className="form-group--heading">
                    Medication Recommendation(s):
                  </div>

                  <div className="form-group form-group--logical-grouping">
                    <label>Over-the-Counter Medication</label>

                    <div className={classnames('form-group')}>
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
                    </div>

                    <HippoToggleButtonGroup
                      id='overTheCounterUse'
                      name='overTheCounterUse'
                      colClasses='col-xs-12'
                      label=''
                      formGroupClassNames=''
                      buttonGroupOnChange={this.handleButtonGroupOnChange}
                      values={['Apply', 'Wash', 'Take by mouth']}
                      visible={this.state.overTheCounterMedication.length > 0 ? true : false}
                    />

                    <div className="row">
                      <HippoTextArea
                        id='overTheCounterFrequency'
                        name="overTheCounterFrequency"
                        rowClasses=''
                        colClasses='col-xs-6'
                        label='Frequency'
                        textAreaOnBlur={this.handleTextAreaOnBlur}
                        textAreaOnChange={this.handleTextAreaOnChange}
                        visible={this.state.overTheCounterMedication.length > 0 ? true : false}
                      />

                      <HippoTextArea
                        id='overTheCounterDuration'
                        name="overTheCounterDuration"
                        rowClasses=''
                        colClasses='col-xs-6'
                        label='Duration'
                        textAreaOnBlur={this.handleTextAreaOnBlur}
                        textAreaOnChange={this.handleTextAreaOnChange}
                        visible={this.state.overTheCounterMedication.length > 0 ? true : false}
                      />
                    </div>

                    <HippoTextArea
                      id='overTheCounterNotes'
                      name="overTheCounterNotes"
                      colClasses='col-xs-12'
                      label='Notes'
                      optional={true}
                      textAreaOnBlur={this.handleTextAreaOnBlur}
                      textAreaOnChange={this.handleTextAreaOnChange}
                      visible={this.state.overTheCounterMedication.length > 0 ? true : false}
                    />
                  </div>

                  <div className="form-group form-group--logical-grouping">
                    <label>Prescription Medication</label>

                    <div className={classnames('form-group')}>
                      <Select
                        placeholder={groupedRecommendationOptions.prescriptionMedications.label}
                        styles={customStyles}
                        components={Animated}
                        closeMenuOnSelect={true}
                        options={groupedRecommendationOptions.prescriptionMedications.options}
                        isMulti={true}
                        onChange={this.recommendationSelectUpdated('prescriptionMedication')}
                        selected={this.state.prescriptionMedication}
                        required
                      />
                    </div>

                    <HippoToggleButtonGroup
                      id='prescriptionUse'
                      name='prescriptionUse'
                      colClasses='col-xs-12'
                      label=''
                      formGroupClassNames=''
                      buttonGroupOnChange={this.handleButtonGroupOnChange}
                      values={['Apply', 'Wash', 'Take by mouth']}
                      visible={this.state.prescriptionMedication.length > 0 ? true : false}
                    />

                    <div className="row">
                      <HippoTextArea
                        id='prescriptionFrequency'
                        name="prescriptionFrequency"
                        rowClasses=''
                        colClasses='col-xs-6'
                        label='Frequency'
                        textAreaOnBlur={this.handleTextAreaOnBlur}
                        textAreaOnChange={this.handleTextAreaOnChange}
                        visible={this.state.prescriptionMedication.length > 0 ? true : false}
                      />

                      <HippoTextArea
                        id='prescriptionDuration'
                        name="prescriptionDuration"
                        rowClasses=''
                        colClasses='col-xs-6'
                        label='Duration'
                        textAreaOnBlur={this.handleTextAreaOnBlur}
                        textAreaOnChange={this.handleTextAreaOnChange}
                        visible={this.state.prescriptionMedication.length > 0 ? true : false}
                      />
                    </div>

                    <HippoTextArea
                      id='prescriptionNotes'
                      name="prescriptionNotes"
                      colClasses='col-xs-12'
                      label='Notes'
                      optional={true}
                      textAreaOnBlur={this.handleTextAreaOnBlur}
                      textAreaOnChange={this.handleTextAreaOnChange}
                      visible={this.state.prescriptionMedication.length > 0 ? true : false}
                    />
                  </div>

                  <div className="form-group--heading">
                    Side Effects:
                  </div>

                  <small className="alert alert-info">
                    Side effects to be Auto-populated, see examples here:

                    &nbsp;&nbsp;&nbsp;
                    <InfoQuestionMark
                      character='1'
                      place="bottom"
                      tooltipText="Example #1: Topical steroids<br/>Side effects of topical steroids when used for a prolonged period can include but <br/>are not limited to striae, telangiectasias skin thinning, change in skin pigment, <br/>acne/folliculitis, and dermatitis."
                    />
                    &nbsp;&nbsp;&nbsp;
                    <InfoQuestionMark
                      character='2'
                      place="bottom"
                      tooltipText="Example #2: Doxycycline<br/>Side effects of doxycycline include but are not limited to nausea, vomiting, esophagitis, <br/>photosensitivity, liver toxicity. This medication should be not used by pregnant women."
                    />
                    &nbsp;&nbsp;
                  </small>
                  <br />
                  <br />

                  {/*<HippoTextArea
                    id='sideEffects'
                    name='sideEffects'
                    colClasses='col-xs-12 col-sm-12 col-md-12'
                    label='Side Effects'
                    optional={true}
                    textAreaOnBlur={this.handleTextAreaOnBlur}
                    textAreaOnChange={this.handleTextAreaOnChange}
                  />*/}
                  <HippoTextArea
                    id='sideEffectsAdditional'
                    name='sideEffectsAdditional'
                    colClasses='col-xs-12 col-sm-12 col-md-12'
                    label='Additional Side Effects'
                    optional={true}
                    textAreaOnBlur={this.handleTextAreaOnBlur}
                    textAreaOnChange={this.handleTextAreaOnChange}
                  />



                  <div className="form-group--heading">
                    Counseling:
                  </div>

                  <small className="alert alert-info">
                    Counseling to be Auto-populated, see examples here:
                    &nbsp;&nbsp;&nbsp;
                    <InfoQuestionMark
                      character='1'
                      place="bottom"
                      tooltipText="Example #1: ABCDEs of Melanoma:<br/>1) Asymmetry – The lesion does not appear to be equal. <br/>2) Border – The borders are irregular or not clearly identifiable. <br/>3) Color: The lesion is multicolored and there are varying shades of color. <br/>4) Diameter: Lesions larger than 6 mm are more concerning for melanoma. <br/>Ugly Duckling spots that appear different from other moles on the body may also be concerning. <br/>5) Evolving: Changes in size or shape of lesion may be concerning for cancer."
                    />
                    &nbsp;&nbsp;&nbsp;
                    <InfoQuestionMark
                      character='2'
                      place="bottom"
                      tooltipText="Example #2: These are common, benign lesions. They rarely become cancerous."
                    />
                    &nbsp;&nbsp;
                  </small>
                  <br />
                  <br />

                  {/*
                  <HippoTextArea
                    id='counseling'
                    name='counseling'
                    colClasses='col-xs-12 col-sm-12 col-md-12'
                    label='Counseling'
                    optional={true}
                    textAreaOnBlur={this.handleTextAreaOnBlur}
                    textAreaOnChange={this.handleTextAreaOnChange}
                  />
                  */}
                  <HippoTextArea
                    id='counselingAdditional'
                    name='counselingAdditional'
                    colClasses='col-xs-12 col-sm-12 col-md-12'
                    label='Additional Counseling'
                    optional={true}
                    textAreaOnBlur={this.handleTextAreaOnBlur}
                    textAreaOnChange={this.handleTextAreaOnChange}
                  />

                  <div className="form-group--heading">
                    Personal Message:
                  </div>

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

                <div
                  className="col-xs-12 col-md-4"
                  style={{display: (this.state.diagnosis !== null) ? 'block' : 'none' }}
                >
                  <div className="well">
                    <HippoStringDisplay
                      label="Your Diagnosis:"
                      value={this.state.diagnosis}
                      visibleIf={this.state.diagnosis !== null}
                    />

                    <HippoStringDisplay
                      label="Over-the-Counter Medication:"
                      value={this.state.overTheCounterRecommendation}
                      visibleIf={this.state.overTheCounterMedication.length > 0}
                    />

                    <HippoStringDisplay
                      label="Prescription Medication:"
                      value={this.state.prescriptionRecommendation}
                      visibleIf={this.state.prescriptionMedication.length > 0}
                    />

                    <HippoStringDisplay
                      label="Side Effects:"
                      value={this.state.sideEffects}
                      visibleIf={this.state.sideEffects.length > 0}
                    />

                    <HippoStringDisplay
                      label="Additional Side Effects:"
                      value={this.state.sideEffectsAdditional}
                      visibleIf={this.state.sideEffectsAdditional.length > 0}
                    />

                    <HippoStringDisplay
                      label="Counseling:"
                      value={this.state.counseling}
                      visibleIf={this.state.counseling.length > 0}
                    />

                    <HippoStringDisplay
                      label="Additional Counseling:"
                      value={this.state.counselingAdditional}
                      visibleIf={this.state.counselingAdditional.length > 0}
                    />

                    <HippoStringDisplay
                      label="Personal Message:"
                      value={this.state.personalMessage}
                      visibleIf={this.state.personalMessage.length > 0}
                    />
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
                  This will send your diagnosis to the patient.
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
