import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getCaseContract, getCaseDetailsLocationHash, getCaseKey } from '../utils/web3-util';
import { downloadJson, downloadImage, getFileUrl } from '../utils/storage-util';
import { withContractRegistry, withSaga, cacheCallValue } from '@/saga-genesis'
import { all } from 'redux-saga/effects'
import { getFileHashFromBytes } from '@/utils/get-file-hash-from-bytes'
import { connect } from 'react-redux'

function mapStateToProps(state, { caseAddress, contractRegistry }) {
  let caseDetailLocationHash = cacheCallValue(state, caseAddress, 'caseDetailLocationHash')
  return {
    caseDetailsHash: getFileHashFromBytes(caseDetailLocationHash)
  }
}

function* saga({ caseAddress }, { cacheCall, contractRegistry }) {
  if (!contractRegistry.hasAddress(caseAddress)) {
    contractRegistry.add(yield getCaseContract(caseAddress))
  }
  yield cacheCall(caseAddress, 'caseDetailLocationHash')
}

const CaseDetails = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['caseAddress'] })(
  class extends Component {
  constructor (props) {
    super(props)
    this.state = {
      details: {}
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

    render() {
        return (
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Case Overview</h2>
                </div>
                <div className="card-content">
                    <div className="row">
                        <div className="col-xs-6 text-center">
                            <label>Overview Photo:</label>
                        </div>
                        <div className="col-xs-6 text-center">
                            <label>Close-up Photo:</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-6 text-center">
                            <img src={this.state.firstImageUrl} alt="Overview" style={{maxHeight: 400}} />
                        </div>
                        <div className="col-xs-6 text-center">
                            <img src={this.state.secondImageUrl} alt="CloseUp" style={{maxHeight: 400}} />
                        </div>
                        <div className="col-xs-12 top10">
                            <label>How long have you had this problem:</label>
                            <p>{this.state.details.howLong}</p>
                        </div>
                        <div className="col-md-6 top10">
                            <label>Is it growing, shrinking or staying the same size:</label>
                            <p>{this.state.details.size}</p>
                        </div>
                        <div className="col-md-6 top10">
                            <label>Any history of skin cancer:</label>
                            <p>{this.state.details.skinCancer}</p>
                        </div>
                        <div className="col-md-6 top10">
                            <label>Are you sexually active:</label>
                            <p>{this.state.details.sexuallyActive}</p>
                        </div>
                        <div className="col-md-6 top10">
                            <label>Age:</label>
                            <p>{this.state.details.age}</p>
                        </div>
                        <div className="col-md-6 top10">
                            <label>Country:</label>
                            <p>{this.state.details.country}</p>
                        </div>
                        <div className="col-xs-12 top10">
                            <label>Additional comments:</label>
                            <p>{this.state.details.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
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
