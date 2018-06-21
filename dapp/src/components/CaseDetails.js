import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { downloadJson, downloadImage } from '../utils/storage-util';
import { withContractRegistry, withSaga, cacheCallValue } from '~/saga-genesis'
import { getFileHashFromBytes } from '~/utils/get-file-hash-from-bytes'
import { connect } from 'react-redux'
import { cacheCall, addContract } from '~/saga-genesis/sagas'

function mapStateToProps(state, { caseAddress }) {
  let caseDetailLocationHash = cacheCallValue(state, caseAddress, 'caseDetailLocationHash')
  return {
    caseDetailsHash: getFileHashFromBytes(caseDetailLocationHash)
  }
}

function* saga({ caseAddress, networkId }) {
  yield addContract({ address: caseAddress, contractKey: 'Case' })
  yield cacheCall(caseAddress, 'caseDetailLocationHash')
}

const CaseDetails = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['caseAddress'] })(
  class _CaseDetails extends Component {
  constructor (props) {
    super(props)
    this.state = {
      details: {},
      firstImageUrl: '',
      secondImageUrl: ''
    }
  }

  componentDidMount () {
    this.init(this.props)
  }

  componentWillReceiveProps (props) {
    this.init(props)
  }

  async init (props) {
    if (!props.caseDetailsHash || !props.caseKey) {
      return
    }
    const detailsJson = await downloadJson(props.caseDetailsHash, props.caseKey)
    const details = JSON.parse(detailsJson);

    const [firstImageUrl, secondImageUrl] = await Promise.all([
      downloadImage(details.firstImageHash, props.caseKey),
      downloadImage(details.secondImageHash, props.caseKey)
    ])

    this.setState({
      details,
      firstImageUrl,
      secondImageUrl
    })
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
    let jsx
    if (!this.props.caseKey) {
      jsx = (
        <div className="row">
          <div className="col-xs-12 col-md-6 col-md-offset-3">
            <h4 className="text-danger">
              Unable to decrypt case data
            </h4>
            <div className="alert alert-warning">
              <p>
                This case data was likely encrypted with a different secret key than the one you are currently using. Please use the secret key in your previous Emergency Kit or email to decrypt this case.
              </p>

              <br />
              <small>Case address: <span className="eth-address">{this.props.caseAddress}</span></small>
            </div>
          </div>
        </div>
      )
    } else {
      jsx = (
          <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  Case Overview
                </h3>
              </div>
              <div className="card-body">
                  <div className="row">
                      <div className="col-xs-12 col-md-6 text-center">
                        <br />
                        <label className="label text-gray">Overview Photo:</label>
                        {this.overviewPhotoHtml()}
                      </div>
                      <div className="col-xs-12 col-md-6 text-center">
                        <br />
                        <label className="label text-gray">Close-up Photo:</label>
                        {this.closeupPhotoHtml()}
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-xs-6">
                          <label className="label text-gray">How long have you had this problem:</label>
                          <p>{this.state.details.howLong}</p>
                      </div>
                      <div className="col-md-6">
                          <label className="label text-gray">Is it growing, shrinking or staying the same size:</label>
                          <p>{this.state.details.size}</p>
                      </div>
                       <div className="col-md-6">
                          <label className="label text-gray">Is it painful:</label>
                          <p>{this.state.details.painful}</p>
                      </div>
                      <div className="col-md-6">
                          <label className="label text-gray">Is it bleeding:</label>
                          <p>{this.state.details.bleeding}</p>
                      </div>
                      <div className="col-md-6">
                          <label className="label text-gray">Is it itching:</label>
                          <p>{this.state.details.itching}</p>
                      </div>

                      <div className="col-md-6">
                          <label className="label text-gray">Any history of skin cancer:</label>
                          <p>{this.state.details.skinCancer}</p>
                      </div>
                      <div className="col-md-6">
                          <label className="label text-gray">Are you sexually active:</label>
                          <p>{this.state.details.sexuallyActive}</p>
                      </div>
                      <div className="col-xs-12">
                           <label className="label text-gray">Has it changed in color:</label>
                           <p>{this.state.details.color}</p>
                       </div>
                       <div className="col-xs-12">
                           <label className="label text-gray">Have you tried any treatments so far:</label>
                           <p>{this.state.details.prevTreatment}</p>
                       </div>
                      <div className="col-md-6">
                          <label className="label text-gray">Age:</label>
                          <p>{this.state.details.age}</p>
                      </div>
                      <div className="col-md-6">
                          <label className="label text-gray">Country:</label>
                          <p>{this.state.details.country}</p>
                      </div>
                      <div className="col-xs-12">
                          <label className="label text-gray">Additional comments:</label>
                          <p>{this.state.details.description}</p>
                      </div>
                  </div>
              </div>
          </div>
      );
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

export default CaseDetails;
