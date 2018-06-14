import React, { Component } from 'react'
import Select from 'react-select'
import * as Animated from 'react-select/lib/animated';
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Spinner from '~/components/Spinner'
import { isNotEmptyString } from '~/utils/common-util'
import hashToHex from '~/utils/hash-to-hex'
import { uploadJson, downloadJson } from '~/utils/storage-util'
import isBlank from '~/utils/is-blank'
import { connect } from 'react-redux'
import { withSend } from '~/saga-genesis'
import { groupedRecommendationOptions } from './recommendationOptions'
import { groupedDiagnosisOptions } from './diagnosisOptions'

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

      canSubmit: false,
      showConfirmationModal: false
    }
  }

  componentDidMount () {
    this.init(this.props)
  }

  componentWillReceiveProps(props) {
    this.init(props)
  }

  init (props) {
    if (props.diagnosisHash) {
      downloadJson(props.diagnosisHash, props.caseKey).then((originalDiagnosis) => {
        this.setState({
          originalDiagnosis: JSON.parse(originalDiagnosis)
        })
      })
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

    this.setState({ canSubmit: valid })
  }

  handleSubmit = async (event) => {
      event.preventDefault()
      this.setState({showConfirmationModal: true})
  }

  handleCancelConfirmSubmissionModal = (event) => {
      this.setState({showConfirmationModal: false})
  }

  handleAcceptConfirmSubmissionModal = async (event) => {
      this.setState({showConfirmationModal: false})
      await this.submitDiagnosis()
  }

  submitDiagnosis = async () => {
    const diagnosisInformation = {
      diagnosis: this.state.diagnosis,
      recommendation: this.state.recommendation,
      additionalRecommendation: this.state.additionalRecommendation
    }
    const diagnosisJson = JSON.stringify(diagnosisInformation)
    const ipfsHash = await uploadJson(diagnosisJson, this.props.caseKey)
    const hashHex = '0x' + hashToHex(ipfsHash)

    if(!isBlank(this.props.diagnosisHash)) {
      const accept = this.state.originalDiagnosis.diagnosis === this.state.diagnosis
      this.setState({
        transactionId: this.props.send(this.props.caseAddress, 'diagnoseChallengedCase', hashHex, accept)()
      })
    } else {
      this.setState({
        transactionId: this.props.send(this.props.caseAddress, 'diagnoseCase', hashHex)()
      })
    }
  }

  render() {
    var transaction = this.props.transactions[this.state.transactionId]
    var loading = !!(transaction && transaction.inFlight)
    var showThankYou = !!(transaction && transaction.complete)

    if (showThankYou)
      this.props.refreshCase(this.props.caseAddress)

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
              <button disabled={!this.state.canSubmit} type="submit" className="btn btn-lg btn-success">Submit</button>
            </div>
          </form>
        </div>

        <Modal show={this.state.showConfirmationModal}>
          <Modal.Body>
            <div className="row">
              <div className="col-xs-12 text-center">
                <h4>Are you sure?</h4>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button onClick={this.handleCancelConfirmSubmissionModal} type="button" className="btn btn-link">No</button>
            <button onClick={this.handleAcceptConfirmSubmissionModal} type="button" className="btn btn-primary">Yes</button>
          </Modal.Footer>
        </Modal>

        <Modal show={showThankYou}>
          <Modal.Body>
            <div className="row">
              <div className="col-xs-12 text-center">
                <h4>Thank you! Your diagnosis submitted successfully.</h4>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Link to='/doctors/cases/open' className="btn btn-primary">OK</Link>
          </Modal.Footer>
        </Modal>

        <Spinner loading={loading} />
      </div>
    )
  }
}))

SubmitDiagnosisContainer.propTypes = {
  caseAddress: PropTypes.string,
  caseKey: PropTypes.any,
  diagnosisHash: PropTypes.string
}
