import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { isEmptyObject } from '~/utils/isEmptyObject'
import { ImageLoader, CaseDetailsLoader } from './ContentLoaders'
import { LoadingLines } from '~/components/LoadingLines'
import { downloadJson, downloadImage } from '../utils/storage-util'
import { withContractRegistry, withSaga, cacheCallValue } from '~/saga-genesis'
import { getFileHashFromBytes } from '~/utils/get-file-hash-from-bytes'
import { cacheCall, addContract } from '~/saga-genesis/sagas'
import { toastr } from '~/toastr'

function mapStateToProps(state, { caseAddress }) {
  let caseDataHash = cacheCallValue(state, caseAddress, 'caseDataHash')
  return {
    caseDetailsHash: getFileHashFromBytes(caseDataHash)
  }
}

function* saga({ caseAddress, networkId }) {
  if (!caseAddress) { return }
  yield addContract({ address: caseAddress, contractKey: 'Case' })
  yield cacheCall(caseAddress, 'caseDataHash')
}

const CaseDetails = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['caseAddress'] })(
  class _CaseDetails extends Component {
  constructor (props) {
    super(props)
    this.state = {
      firstImageUrl: '',
      secondImageUrl: '',
      loading: true
    }
  }

  componentDidMount () {
    this.init(this.props)
  }

  componentWillReceiveProps (props) {
    this.init(props)
  }

  async init (props) {
    if (this.state.details || !(props.caseDetailsHash && props.caseKey)) { return }

    try {
      const detailsJson = await downloadJson(props.caseDetailsHash, props.caseKey)
      const details = JSON.parse(detailsJson)

      const [firstImageUrl, secondImageUrl] = await Promise.all([
        downloadImage(details.firstImageHash, props.caseKey),
        downloadImage(details.secondImageHash, props.caseKey)
      ])

      this.setState({
        details,
        firstImageUrl,
        secondImageUrl
      })
    } catch (error) {
      toastr.error('There was an error while downloading your case details from IPFS.')
      console.warn(error)
    } finally {
      this.setState({
        loading: false
      })
    }
  }

  overviewPhotoHtml = () => {
    let html = <span></span>
    if (this.state.firstImageUrl.length > 0) {
      html = (
        <img
          src={this.state.firstImageUrl}
          alt="Overview"
          style={{maxHeight: 400}}
          className="img-responsive" />
      )
    }

    return html
  }

  closeupPhotoHtml = () => {
    let html = <span></span>
    if (this.state.secondImageUrl.length > 0) {
      html = (
        <img
          src={this.state.secondImageUrl}
          alt="Close-up"
          style={{maxHeight: 400}}
          className="img-responsive" />
      )
    }

    return html
  }

  render() {
    const { caseKey, caseAddress, caseIsOpenForDoctor } = this.props
    const details = this.state.details || {}
    let jsx
    if (caseIsOpenForDoctor) {
      var submitDiagnosisLink = (
        <span>
          <br />
          <small><a className="link--internal" href="#submit-diagnosis">Submit Your Diagnosis</a></small>
        </span>
      )
    }

    if (!this.state.loading && isEmptyObject(details)) {
      jsx = (
        <div className="row">
          <div className="col-xs-12 col-md-6 col-md-offset-3">
            <div className="alert alert-warning">
              <h4>
                Unable to download case data from IPFS
              </h4>
              <p>
                There is probably an issue with the IPFS server. Please contact MedCredits support.
              </p>

              <br />
              <small>
                Error #2: Unable to download case data from IPFS
              </small>
              <small>
                Case address: <span className="eth-address">{caseAddress}</span>
              </small>
            </div>
          </div>
        </div>
      )
    } else if (caseKey === null) {
      jsx = (
        <div className="row">
          <div className="col-xs-12 col-md-6 col-md-offset-3">
            <div className="alert alert-warning">
              <h4>
                Unable to decrypt case data
              </h4>
              <p>
                This case data was likely encrypted with a different secret key than the one you are currently using. Please use the secret key in your previous Emergency Kit or email to decrypt this case.
              </p>

              <br />
              <small>
                Error #1: Unable to decrypt case or ipfs data expired.
              </small>
              <small>
                Case address: <span className="eth-address">{caseAddress}</span>
              </small>
            </div>
          </div>
        </div>
      )
    } else {
      jsx = (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Case Overview <LoadingLines visible={this.state.loading} color="#aaaaaa" />
              {submitDiagnosisLink}
            </h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-xs-12 col-md-6">
                <br />
                <label className="label text-gray">Overview Photo:</label>
                <ImageLoader className={classNames({ 'hidden': !this.state.loading })} />

                {this.overviewPhotoHtml()}
              </div>
              <div className="col-xs-12 col-md-6">
                <br />
                <label className="label text-gray">Close-up Photo:</label>
                <ImageLoader className={classNames({ 'hidden': !this.state.loading })} />

                {this.closeupPhotoHtml()}
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-xs-12 col-sm-12 col-md-6">
                <CaseDetailsLoader className={classNames('loader--case-details', { 'hidden': !this.state.loading })} />
              </div>
            </div>

            <span className={classNames({ 'hidden': this.state.loading })}>
              <div className="row case-details--row">
                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                  <label className="label text-gray">Age:</label>
                  <p>{details.age}</p>
                </div>

                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                  <label className="label text-gray">Gender:</label>
                  <p>{details.gender}</p>
                </div>

                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                  <label className="label text-gray">Pregnant:</label>
                  <p>{details.pregnant}</p>
                </div>
              </div>

              <div className="row case-details--row">
                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                  <label className="label text-gray">Country:</label>
                  <p>{details.country}</p>
                </div>

                {details.country === 'US' ? (
                  <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                    <label className="label text-gray">Region:</label>
                    <p>{details.region}</p>
                  </div>
                ) : null}
              </div>

              <div className="row case-details--row">
                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                  <label className="label text-gray">Allergies:</label>
                  <p>{details.allergies}</p>
                </div>

                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                  <label className="label text-gray">Which allergies:</label>
                  <p>{details.whatAllergies}</p>
                </div>
              </div>

              <div className="row case-details--row">
                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                  <label className="label text-gray">Type of problem:</label>
                  <p>{details.spotRashOrAcne}</p>
                </div>

                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                  <label className="label text-gray">How long have they had this problem:</label>
                  <p>{details.howLong}</p>
                </div>

                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                  <label className="label text-gray">Have they had it before:</label>
                  <p>{details.hadBefore}</p>
                </div>

                {details.spotRashOrAcne === 'Spot' ? (
                  <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                    <label className="label text-gray">Spot characteristics:</label>
                    <p>{details.isTheSpot}</p>
                  </div>
                ) : null}

                {details.spotRashOrAcne === 'Rash' ? (
                  <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                    <label className="label text-gray">Rash characteristics:</label>
                    <p>{details.isTheRash}</p>
                  </div>
                ) : null}

                {details.spotRashOrAcne === 'Acne' ? (
                  <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                    <label className="label text-gray">Acne characteristics:</label>
                    <p>{details.acneDoesItInclude}</p>
                  </div>
                ) : null}
              </div>


              {
                details.gender === 'Female' ? (
                  <div className="row case-details--row">
                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                      <label className="label text-gray">Worse with period:</label>
                      <p>{details.worseWithPeriod}</p>
                    </div>

                    <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                      <label className="label text-gray">On birth control:</label>
                      <p>{details.onBirthControl}</p>
                    </div>
                  </div>
                ) : null
              }

              <div className="row case-details--row">
                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                  <label className="label text-gray">Sexually active:</label>
                  <p>{details.sexuallyActive}</p>
                </div>

                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                  <label className="label text-gray">Tried treatments previously:</label>
                  <p>{details.prevTreatment}</p>
                </div>
              </div>

              <div className="row case-details--row">
                <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3">
                  <label className="label text-gray">Additional comments:</label>
                  <p>{details.description}</p>
                </div>
              </div>
            </span>

          </div>
        </div>
      )
    }
    return jsx
  }
})))

CaseDetails.propTypes = {
  caseAddress: PropTypes.string,
  caseKey: PropTypes.string
}

CaseDetails.defaultProps = {
  caseAddress: null,
  firstImageUrl: null,
  secondImageUrl: null,
  details: {}
}

export default CaseDetails
