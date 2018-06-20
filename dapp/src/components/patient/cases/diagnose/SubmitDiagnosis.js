import React, { Component } from 'react'
import Select from 'react-select'
import * as Animated from 'react-select/lib/animated';
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Spinner } from '~/components/Spinner'
import { isNotEmptyString } from '~/utils/common-util'
import { mixpanel } from '~/mixpanel'
import hashToHex from '~/utils/hash-to-hex'
import { uploadJson, downloadJson } from '~/utils/storage-util'
import isBlank from '~/utils/is-blank'
import { connect } from 'react-redux'
import { withSend } from '~/saga-genesis'
import { groupedRecommendationOptions } from './recommendationOptions'
import { groupedDiagnosisOptions } from './diagnosisOptions'
import { TransactionStateHandler } from '~/saga-genesis/TransactionStateHandler'
import { toastr } from '~/toastr'
import * as routes from '~/config/routes'

// The react-select <Select /> component uses inline CSS, this fixes it for mobile:
const customStyles = {
  multiValue: (base, state) => ({
    ...base,
    maxWidth: '260px',
    whiteSpace: 'inherit'
  })
}

function mapStateToProps (state, ownProps) {
  return {
    transactions: state.sagaGenesis.transactions
  }
}

function mapDispatchToProps (dispatch) {
  return {
    refreshCase: (address) => dispatch({type: 'CACHE_INVALIDATE_ADDRESS', address})
  }
}

export const SubmitDiagnosisContainer = connect(mapStateToProps, mapDispatchToProps)(withSend(class extends Component {
  static propTypes = {
    caseAddress: PropTypes.string,
    caseKey: PropTypes.any,
    diagnosisHash: PropTypes.string
  }

  constructor(props, context){
    super(props, context)

    this.state = {
      overTheCounterRecommendation: [],
      topicalMedicationsRecommendation: [],
      oralMedicationsRecommendation: [],
      proceduresRecommendation: [],
      otherRecommendation: [],
      additionalRecommendation: '',

      isChallenge: false,
      originalDiagnosis: null,

      diagnosis: null,
      recommendation: null,

      formIsValid: false,
      showConfirmationModal: false,

      showThankYou: false,
      isSubmitting: false
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
        .onTxHash(() => {
          this.setState({
            transactionHandler: null,
            showThankYou: true,
            isSubmitting: false
          })
        })
    }
  }

  init (props) {
    if (this.state.originalDiagnosis || !props.diagnosisHash || !props.caseKey) { return }
    downloadJson(props.diagnosisHash, props.caseKey).then((originalDiagnosis) => {
      this.setState({
        originalDiagnosis: JSON.parse(originalDiagnosis)
      })
    })
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

  // This is the recommendation the physician can type into the textarea below
  updateAdditionalRecommendation = (event) => {
    this.setState({ additionalRecommendation: event.target.value })
  }

  // Combines the selected recommendation arrays
  buildFinalRecommendation = () => {
    let recommendation = [
      this.state.overTheCounterRecommendation.join(', '),
      this.state.topicalMedicationsRecommendation.join(', '),
      this.state.oralMedicationsRecommendation.join(', '),
      this.state.proceduresRecommendation.join(', '),
      this.state.otherRecommendation.join(', ')
    ].filter(element => (element !== (undefined || null || '')))
     .join(', ')

    this.setState({ recommendation }, this.validateInputs)
  }

  validateInputs = () => {
    const valid =
      isNotEmptyString(this.state.diagnosis) &&
      isNotEmptyString(this.state.recommendation)

    this.setState({ formIsValid: valid })
  }

  handleSubmit = async (event) => {
    event.preventDefault()
    this.setState({ showConfirmationModal: true })
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
      recommendation: this.state.recommendation,
      additionalRecommendation: this.state.additionalRecommendation
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
      transactionHandler: new TransactionStateHandler()
    })
  }

  render() {
    const loading = this.state.isSubmitting

    return (
      <div>
        <div className="card">
          <form onSubmit={this.handleSubmit} >
            <div className="card-header">
              <h3 className="card-title">
                Submit Diagnosis
                <br /><small><a className="link--internal" href="#view-case-details">View Case Details</a></small>
              </h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xs-12 col-md-8">
                  <div className="form-group">
                    <label>Diagnosis<span className='star'>*</span></label>
                    <Select
                      placeholder="--- Choose a diagnosis ---"
                      styles={customStyles}
                      components={Animated}
                      closeMenuOnSelect={true}
                      options={groupedDiagnosisOptions}
                      onChange={this.updateDiagnosis}
                      required />
                  </div>

                  <div className="form-group">
                    <label>Recommendation(s)<span className='star'>*</span></label>

                    <div className="form-group">
                      <Select
                        placeholder={groupedRecommendationOptions.overTheCounter.label}
                        styles={customStyles}
                        components={Animated}
                        closeMenuOnSelect={true}
                        options={groupedRecommendationOptions.overTheCounter.options}
                        isMulti={true}
                        onChange={this.recommendationSelectUpdated('overTheCounterRecommendation')}
                        selected={this.state.overTheCounterRecommendation}
                        required />
                    </div>

                    <div className="form-group">
                      <Select
                        placeholder={groupedRecommendationOptions.topicalMedications.label}
                        styles={customStyles}
                        components={Animated}
                        closeMenuOnSelect={true}
                        options={groupedRecommendationOptions.topicalMedications.options}
                        isMulti={true}
                        onChange={this.recommendationSelectUpdated('topicalMedicationsRecommendation')}
                        selected={this.state.topicalMedicationsRecommendation}
                        required />
                    </div>

                    <div className="form-group">
                      <Select
                        placeholder={groupedRecommendationOptions.oralMedications.label}
                        styles={customStyles}
                        components={Animated}
                        closeMenuOnSelect={true}
                        options={groupedRecommendationOptions.oralMedications.options}
                        isMulti={true}
                        onChange={this.recommendationSelectUpdated('oralMedicationsRecommendation')}
                        selected={this.state.oralMedicationsRecommendation}
                        required />
                    </div>

                    <div className="form-group">
                      <Select
                        placeholder={groupedRecommendationOptions.procedures.label}
                        styles={customStyles}
                        components={Animated}
                        closeMenuOnSelect={true}
                        options={groupedRecommendationOptions.procedures.options}
                        isMulti={true}
                        onChange={this.recommendationSelectUpdated('proceduresRecommendation')}
                        selected={this.state.proceduresRecommendation}
                        required />
                    </div>

                    <div className="form-group">
                      <Select
                        placeholder={groupedRecommendationOptions.other.label}
                        styles={customStyles}
                        components={Animated}
                        closeMenuOnSelect={true}
                        options={groupedRecommendationOptions.other.options}
                        isMulti={true}
                        onChange={this.recommendationSelectUpdated('otherRecommendation')}
                        selected={this.state.otherRecommendation}
                        required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      Additional Recommendation
                      &nbsp; <span className="text-gray">(Optional)</span>
                    </label>

                    <textarea
                      onChange={this.updateAdditionalRecommendation}
                      className="form-control"
                      rows="3" />
                  </div>
                </div>

                <div className="col-xs-12 col-md-4">
                  <div className="well">
                    <label className="text-gray">Your diagnosis:</label>
                    <p>
                      {(this.state.diagnosis !== null)
                        ? this.state.diagnosis
                        : 'no diagnosis entered.'}
                    </p>

                    <label className="text-gray">Your recommendation:</label>
                    <p>
                      {(this.state.recommendation !== null)
                        ? this.state.recommendation
                        : 'no recommendation entered.'}
                    </p>

                    {(this.state.additionalRecommendation.length > 0)
                      ? (
                          <div>
                            <label className="text-gray">Your additional recommendation:</label>
                            <p>
                              {this.state.additionalRecommendation}
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
                disabled={loading || !this.state.formIsValid}
                type="submit"
                className="btn btn-lg btn-success">Submit Diagnosis</button>
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
                  This will send your diagnosis and recommendation to the patient.
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

        <Modal show={this.state.showThankYou}>
          <Modal.Body>
            <div className="row">
              <div className="col-xs-12 text-center">
                <h4>Thank you!</h4>
                <h5>Your diagnosis submitted successfully.</h5>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Link to={routes.DOCTORS_CASES_OPEN} className="btn btn-primary">OK</Link>
          </Modal.Footer>
        </Modal>

        <Spinner loading={loading} />
      </div>
    )
  }
}))
