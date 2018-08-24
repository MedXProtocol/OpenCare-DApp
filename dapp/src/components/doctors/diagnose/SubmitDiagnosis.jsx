import ReactDOMServer from 'react-dom/server'
import React, { Component } from 'react'
import ReactTimeout from 'react-timeout'
import Select from 'react-select'
import { connect } from 'react-redux'
import * as Animated from 'react-select/lib/animated';
import { withRouter } from 'react-router-dom'
import { Checkbox, Modal } from 'react-bootstrap'
import FlipMove from 'react-flip-move'
import PropTypes from 'prop-types'
import { mixpanel } from '~/mixpanel'
import hashToHex from '~/utils/hash-to-hex'
import { cancelablePromise } from '~/utils/cancelablePromise'
import { uploadJson, downloadJson } from '~/utils/storage-util'
import { isBlank } from '~/utils/isBlank'
import {
  contractByName,
  TransactionStateHandler,
  withSend
} from '~/saga-genesis'
import { customStyles } from '~/config/react-select-custom-styles'
import { groupedDiagnosisOptions } from './diagnosisOptions'
import { sideEffectValues, counselingValues } from '~/sideEffectsAndCounselingValues'
import { HippoStringDisplay } from '~/components/HippoStringDisplay'
import { HippoTextArea } from '~/components/forms/HippoTextArea'
import { Loading } from '~/components/Loading'
import { toastr } from '~/toastr'
import pull from 'lodash.pull'
import * as routes from '~/config/routes'
import { Medication } from './Medication'
import { groupedRecommendationOptions } from './recommendationOptions'

//used to distinguish prescription components
let medicationId = 1

function mapStateToProps (state, ownProps) {
  const CaseLifecycleManager = contractByName(state, 'CaseLifecycleManager')

  return {
    CaseLifecycleManager,
    transactions: state.sagaGenesis.transactions
  }
}

export const SubmitDiagnosisContainer = withRouter(ReactTimeout(connect(mapStateToProps)(withSend(class _SubmitDiagnosisContainer extends Component {
  static propTypes = {
    caseAddress: PropTypes.string,
    caseKey: PropTypes.any,
    diagnosisHash: PropTypes.string
  }

  constructor(props, context){
    super(props, context)

    this.state = {
      overTheCounterRecommendation: '',

      prescriptions: [
        {
          medicationId: ++medicationId
        }
      ],
      prescriptionErrors: {},

      overTheCounters: [
        {
          medicationId: ++medicationId
        }
      ],
      overTheCounterErrors: {},

      noFurtherTreatment: false,

      sideEffectsAdditional: '',
      sideEffectValuesChosen: [],
      autopopulatedSideEffectsText: '',

      counselingAdditional: '',
      counselingValuesChosen: [],
      autopopulatedCounselingText: '',

      personalMessage: '',

      isChallenge: false,
      originalDiagnosis: null,

      diagnosis: null,

      showConfirmationModal: false,

      isSubmitting: false,
      errors: [],

      cancelableDownloadPromise: undefined
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

  componentWillUnmount () {
    if (this.state.cancelableDownloadPromise) {
      this.state.cancelableDownloadPromise.cancel()
    }
  }

  init (props) {
    if (
      this.state.originalDiagnosis
      || !props.diagnosisHash
      || !props.caseKey
      || this.state.cancelableDownloadPromise
    ) { return }

    try {
      const cancelableDownloadPromise = cancelablePromise(
        new Promise(async (resolve, reject) => {
          const originalDiagnosisJson = await downloadJson(props.diagnosisHash, props.caseKey)

          if (originalDiagnosisJson) {
            const originalDiagnosis = JSON.parse(originalDiagnosisJson)

            return resolve({ originalDiagnosis })
          } else {
            return reject('There was an error')
          }
        })
      )

      this.setState({ cancelableDownloadPromise })

      cancelableDownloadPromise
        .promise
        .then((result) => {
          this.setState(result)
          this.setState({
            loading: false
          })
        })
        .catch((reason) => {
          // console.log('isCanceled', reason.isCanceled)
        })
    } catch (error) {
      toastr.error('There was an error while downloading your case details from IPFS.')
      console.warn(error)
      this.setState({
        loading: false
      })
    }
  }

  resetFieldGroup(fieldGroup) {
    this.setState({
      [`${fieldGroup}Use`]: null,
      [`${fieldGroup}Medication`]: [],
      [`${fieldGroup}Notes`]: '',
      [`${fieldGroup}Frequency`]: '',
      [`${fieldGroup}Duration`]: '',
      [`${fieldGroup}Recommendation`]: ''
    })
  }

  handleSideEffectsChecked = (event) => {
    const value = parseInt(event.target.value, 10)
    let sideEffectValuesChosen = this.state.sideEffectValuesChosen
    let sideEffectsText = []

    sideEffectValuesChosen.includes(value)
      ? pull(sideEffectValuesChosen, value)
      : sideEffectValuesChosen.push(value)

    sideEffectValuesChosen.sort().forEach(index => {
      sideEffectsText.push(sideEffectValues[index])
    })

    this.setState({
      sideEffectValuesChosen,
      autopopulatedSideEffectsText: sideEffectsText.join('<br/><br/>')
    })
  }

  handleCounselingChecked = (event) => {
    const value = parseInt(event.target.value, 10)
    let counselingValuesChosen = this.state.counselingValuesChosen
    let counselingText = []

    counselingValuesChosen.includes(value)
      ? pull(counselingValuesChosen, value)
      : counselingValuesChosen.push(value)

    counselingValuesChosen.sort().forEach(index => {
      counselingText.push(counselingValues[index])
    })

    this.setState({
      counselingValuesChosen,
      autopopulatedCounselingText: counselingText.join('<br/><br/>')
    })
  }

  handleButtonGroupOnChange = (event) => {
    this.setState({ [event.target.name]: event.target.value }, () => {
      this.buildFinalRecommendation()
    })
  }

  handleTextAreaOnChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value
    }, this.buildFinalRecommendation)
  }

  updateMedications = (array, errors, index, medication) => {
    if (!medication.prescription) {
      // if the prescription was removed
      if (array.length === 1) {
        // reset the value
        array[index] = {
          medicationId: medication.medicationId
        }
        errors[medicationId] = {}
      } else {
        // if we have more than one, remove it
        array.splice(index, 1)
      }
    } else {
      // if the medication was previously unset
      if (!array[index].prescription) {
        // make sure we have an empty one on the end
        array.push({
          medicationId: ++medicationId
        })
      }
      array[index] = medication
    }
  }

  onChangeNoFurtherTreatment = (event) => {
    this.setState({
      noFurtherTreatment: !this.state.noFurtherTreatment,
      overTheCounterRecommendation: '',
      prescriptionRecommendation: ''
    })
  }

  onChangePrescription = (index, medication) => {
    const copy = [...this.state.prescriptions]
    const errorsCopy = {...this.state.prescriptionErrors}
    this.updateMedications(copy, errorsCopy, index, medication)
    this.setState({ prescriptions: copy, prescriptionErrors: errorsCopy }, this.buildFinalRecommendation)
  }

  onChangeOverTheCounter = (index, medication) => {
    const copy = [...this.state.overTheCounters]
    const errorsCopy = {...this.state.overTheCounterErrors}
    this.updateMedications(copy, errorsCopy, index, medication)
    this.setState({ overTheCounters: copy, overTheCounterErrors: errorsCopy }, this.buildFinalRecommendation)
  }

  // This is the diagnosis chosen in the 'react-select' <Select> components
  updateDiagnosis = (newValue) => {
    this.setState({ diagnosis: newValue.value })
  }

  // Combines the selected overTheCounter* and prescription* values into their
  // respective React groups
  buildFinalRecommendation = () => {
    const overTheCounterRecommendation = this.renderMedications(this.state.overTheCounters)
    const prescriptionRecommendation = this.renderMedications(this.state.prescriptions)

    this.setState({
      overTheCounterRecommendation,
      prescriptionRecommendation
    })
  }

  renderMedications (medications) {
    if (!medications[0].prescription) {
      return null
    }
    return ReactDOMServer.renderToStaticMarkup(
      <div>
        {medications.map(medication => this.renderMedicationSummary(medication))}
      </div>
    )
  }

  renderMedicationSummary = (medication) => {
    let recommendation = <div key={medication.medicationId}></div>
    let duration = <span></span>

    if (medication.prescription) {
      if (medication.duration) {
        duration = `for ${medication.duration}`
      }
      recommendation =
        <React.Fragment key={medication.medicationId}>
          <p>
            <strong>{medication.prescription.label}</strong>
            <br />
            {medication.use} {medication.frequency} {duration}
            {medication.notes ? <br /> : ''}
            {medication.notes}
          </p>
        </React.Fragment>
    }

    return recommendation
  }

  checkMedicationErrors (medications) {
    const medicationErrors = {}
    let isError = false
    for (var index in medications) {
      const pErrors = {}
      const { prescription, frequency, duration, medicationId } = medications[index]
      medicationErrors[medicationId] = pErrors
      pErrors.frequency = prescription && !frequency
      pErrors.duration = prescription && !duration
      isError = isError || pErrors.frequency || pErrors.duration
    }
    return [medicationErrors, isError]
  }

  runValidation = async () => {
    await this.setState({
      errors: [],
      prescriptionErrors: {},
      overTheCounterErrors: {},
      isError: false
    })

    let errors = []

    const [ prescriptionErrors, isPrescriptionError ] = this.checkMedicationErrors(this.state.prescriptions)
    const [ overTheCounterErrors, isOverTheCounterError ] = this.checkMedicationErrors(this.state.overTheCounters)

    if (isOverTheCounterError) {
      errors.push('over-the-counter')
    }

    if (isPrescriptionError) {
      errors.push('prescriptions')
    }

    if (this.state.diagnosis === null) {
      errors.push('diagnosis')
    }

    if (
      !this.state.prescriptions[0].prescription
      && !this.state.overTheCounters[0].prescription
      && !this.state.noFurtherTreatment
    ) {
      errors.push('oneRecommendation')
    }

    const isError = errors.length || isPrescriptionError || isOverTheCounterError

    if (errors.length) {
      // First reset it so it will still take the user to the anchor even if
      // we already took them there before (still error on same field)
      window.location.hash = `#`;

      // Go to first error field
      window.location.hash = `#${errors[0]}`;
    }

    await this.setState({
      errors,
      prescriptionErrors,
      overTheCounterErrors,
      isError
    })
  }

  handleSubmit = async (event) => {
    event.preventDefault()

    await this.runValidation()

    if (!this.state.isError) {
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
      prescriptionRecommendation: this.state.prescriptionRecommendation,
      noFurtherTreatment: this.state.noFurtherTreatment ? 1 : 0,
      sideEffectValuesChosen: this.state.sideEffectValuesChosen,
      sideEffectsAdditional: this.state.sideEffectsAdditional,
      counselingValuesChosen: this.state.counselingValuesChosen,
      counselingAdditional: this.state.counselingAdditional,
      personalMessage: this.state.personalMessage
    }
    const diagnosisJson = JSON.stringify(diagnosisInformation)
    const ipfsHash = await uploadJson(diagnosisJson, this.props.caseKey)
    const hashHex = '0x' + hashToHex(ipfsHash)

    let transactionId
    if(!isBlank(this.props.diagnosisHash)) {
      const accept = this.state.originalDiagnosis.diagnosis === this.state.diagnosis
      transactionId = this.props.send(
        this.props.CaseLifecycleManager,
        'diagnoseChallengedCase',
        this.props.caseAddress,
        hashHex,
        accept
      )()
      mixpanel.track('Submit Challenged Case Diagnosis')
    } else {
      transactionId = this.props.send(
        this.props.CaseLifecycleManager,
        'diagnoseCase',
        this.props.caseAddress,
        hashHex
      )()
      mixpanel.track('Submit Case Diagnosis')
    }
    this.setState({
      transactionId,
      transactionHandler: new TransactionStateHandler(),
      showConfirmationModal: false
    })
  }

  errorMessage = (fieldName) => {
    let msg = 'must be filled out'

    if (fieldName === 'diagnosis') {
      msg = 'please enter a diagnosis or choose "Other"'
    } else if (fieldName === 'oneRecommendation') {
      msg = 'please choose a medication or check "No Further Treatment Necessary"'
    }

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

    const prescriptions = this.state.prescriptions
    const overTheCounters = this.state.overTheCounters

    const showDiagnosisSummary = this.state.diagnosis !== null || this.state.overTheCounterRecommendation || this.state.prescriptionRecommendation

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

                  <span id="oneRecommendation" />

                  <div className="form-group--heading">
                    Medication Recommendation(s):
                  </div>

                  {errors['oneRecommendation']}


                  <FlipMove
                    enterAnimation="accordionVertical"
                    leaveAnimation="accordionVertical"
                  >
                    <div
                      className="form-group form-group--logical-grouping"
                      key={`key-noFurtherTreatment`}
                    >
                      <label className="checkbox-inline">
                        <input type="checkbox" onClick={this.onChangeNoFurtherTreatment} /> &nbsp;
                        No Further Treatment Necessary
                      </label>
                    </div>
                  </FlipMove>


                  <div id='over-the-counter' />
                  <FlipMove
                    enterAnimation="accordionVertical"
                    leaveAnimation="accordionVertical"
                  >
                    {(this.state.noFurtherTreatment)
                      ? <span key={`key-overTheCounter-hidden`} />
                      :
                      overTheCounters.map((overTheCounter, index) => {
                        return (
                          <Medication
                            title='Over-the-Counter Medication'
                            key={overTheCounter.medicationId}
                            medication={overTheCounter}
                            errors={this.state.overTheCounterErrors[overTheCounter.medicationId] || {}}
                            onChange={(medication) => this.onChangeOverTheCounter(index, medication)}
                            recommendationOptions={groupedRecommendationOptions.overTheCounter}
                            />
                        )
                      })
                    }
                  </FlipMove>

                  <div id='prescriptions' />
                  <FlipMove
                    enterAnimation="accordionVertical"
                    leaveAnimation="accordionVertical"
                  >
                    {(this.state.noFurtherTreatment)
                      ? <span key={`key-prescriptionMedication-hidden`} />
                      :
                      prescriptions.map((prescription, index) => {
                        return (
                          <Medication
                            key={prescription.medicationId}
                            medication={prescription}
                            errors={this.state.prescriptionErrors[prescription.medicationId] || {}}
                            onChange={(medication) => this.onChangePrescription(index, medication)}
                            recommendationOptions={groupedRecommendationOptions.prescriptionMedications}
                            />
                        )
                      })
                    }
                  </FlipMove>

                  <FlipMove
                    enterAnimation="accordionVertical"
                    leaveAnimation="accordionVertical"
                  >
                    {(
                      prescriptions[0].prescription !== ''
                      || overTheCounters[0].prescription !== ''
                     )
                      ? <span key={`key-sideEffects-hidden`} />
                      : (
                        <div key={`key-sideEffects`}>
                          <div className="form-group form-group--logical-grouping">
                            <div className="form-group--heading">
                              Side Effects:
                            </div>

                            <div className="row">
                              <div className="col-xs-12">
                                <div className="form-group">
                                  <small className="text-gray">
                                    (Side effects to be Auto-populated based on diagnosis and recommendation choices.)
                                  </small>
                                </div>
                              </div>
                            </div>

                            <div className="row">
                              <div className="col-xs-12">
                                <div className="form-group">
                                  <Checkbox
                                    inline
                                    onClick={this.handleSideEffectsChecked}
                                    value={0}
                                  >
                                    Topical Steroids
                                  </Checkbox>

                                  <Checkbox
                                    inline
                                    onClick={this.handleSideEffectsChecked}
                                    value={1}
                                  >
                                    Doxycycline
                                  </Checkbox>
                                </div>
                              </div>
                            </div>
                            <p dangerouslySetInnerHTML={{__html: this.state.autopopulatedSideEffectsText}} />
                            <br />

                            <HippoTextArea
                              id='sideEffectsAdditional'
                              name='sideEffectsAdditional'
                              colClasses='col-xs-12 col-sm-12 col-md-12'
                              label='Additional Side Effects'
                              optional={true}
                              textAreaOnChange={this.handleTextAreaOnChange}
                            />
                          </div>
                        </div>
                        )
                    }
                  </FlipMove>


                  <div className="form-group form-group--logical-grouping">
                    <div className="form-group--heading">
                      Counseling:
                    </div>

                    <div className="row">
                      <div className="col-xs-12">
                        <div className="form-group">
                          <small className="text-gray">
                            (Counseling to be Auto-populated based on diagnosis and recommendation(s).)
                          </small>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-xs-12">
                        <div className="form-group">
                          <Checkbox
                            inline
                            onClick={this.handleCounselingChecked}
                            value={0}
                          >
                            Melanoma
                          </Checkbox>

                          <Checkbox
                            inline
                            onClick={this.handleCounselingChecked}
                            value={1}
                          >
                            Benign Lesions
                          </Checkbox>
                        </div>
                      </div>
                    </div>
                    <p dangerouslySetInnerHTML={{__html: this.state.autopopulatedCounselingText}} />
                    <br />

                    <HippoTextArea
                      id='counselingAdditional'
                      name='counselingAdditional'
                      colClasses='col-xs-12 col-sm-12 col-md-12'
                      label='Additional Counseling'
                      optional={true}
                      textAreaOnChange={this.handleTextAreaOnChange}
                    />
                  </div>

                  <div className="form-group--heading">
                    Personal Message:
                  </div>

                  <HippoTextArea
                    id='personalMessage'
                    name='personalMessage'
                    colClasses='col-xs-12 col-sm-12 col-md-12'
                    label='Personal Message'
                    optional={true}
                    textAreaOnChange={this.handleTextAreaOnChange}
                  />
                </div>

                <div
                  className="col-xs-12 col-md-4"
                  style={{display: (showDiagnosisSummary) ? 'block' : 'none' }}
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
                      visibleIf={!!this.state.overTheCounterRecommendation}
                    />

                    <HippoStringDisplay
                      label="Prescription Medication:"
                      value={this.state.prescriptionRecommendation}
                      visibleIf={!!this.state.prescriptionRecommendation}
                    />

                    <HippoStringDisplay
                      label="No Further Treatment Necessary"
                      value={''}
                      visibleIf={this.state.noFurtherTreatment}
                    />

                    <HippoStringDisplay
                      label="Side Effects:"
                      value={this.state.autopopulatedSideEffectsText}
                      visibleIf={this.state.autopopulatedSideEffectsText.length > 0}
                    />

                    <HippoStringDisplay
                      label="Additional Side Effects:"
                      value={this.state.sideEffectsAdditional}
                      visibleIf={this.state.sideEffectsAdditional.length > 0}
                    />

                    <HippoStringDisplay
                      label="Counseling:"
                      value={this.state.autopopulatedCounselingText}
                      visibleIf={this.state.autopopulatedCounselingText.length > 0}
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
