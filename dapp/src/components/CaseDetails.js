import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getCaseDetailsLocationHash, getCaseKey } from '../utils/web3-util';
import { downloadJson, downloadImage, getFileUrl } from '../utils/storage-util';
import { withPropSaga } from '@/components/with-prop-saga'
import { all } from 'redux-saga/effects'

function* propSaga(ownProps) {
  if (!ownProps.caseKey) { return }
  const caseDetailsHash = yield getCaseDetailsLocationHash(ownProps.caseAddress);
  const detailsJson = yield downloadJson(caseDetailsHash, ownProps.caseKey);
  const details = JSON.parse(detailsJson);

  const [firstImageUrl, secondImageUrl] = yield all([
    downloadImage(details.firstImageHash, ownProps.caseKey),
    downloadImage(details.secondImageHash, ownProps.caseKey)
  ])

  return {
    details,
    firstImageUrl,
    secondImageUrl
  }
}

const CaseDetails = withPropSaga(propSaga, class extends Component {
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
                            <img src={this.props.firstImageUrl} alt="Overview" style={{maxHeight: 400}} />
                        </div>
                        <div className="col-xs-6 text-center">
                            <img src={this.props.secondImageUrl} alt="CloseUp" style={{maxHeight: 400}} />
                        </div>
                        <div className="col-xs-12 top10">
                            <label>How long have you had this problem:</label>
                            <p>{this.props.details.howLong}</p>
                        </div>
                        <div className="col-md-6 top10">
                            <label>Is it growing, shrinking or staying the same size:</label>
                            <p>{this.props.details.size}</p>
                        </div>
                        <div className="col-md-6 top10">
                            <label>Any history of skin cancer:</label>
                            <p>{this.props.details.skinCancer}</p>
                        </div>
                        <div className="col-md-6 top10">
                            <label>Are you sexually active:</label>
                            <p>{this.props.details.sexuallyActive}</p>
                        </div>
                        <div className="col-md-6 top10">
                            <label>Age:</label>
                            <p>{this.props.details.age}</p>
                        </div>
                        <div className="col-md-6 top10">
                            <label>Country:</label>
                            <p>{this.props.details.country}</p>
                        </div>
                        <div className="col-xs-12 top10">
                            <label>Additional comments:</label>
                            <p>{this.props.details.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
})

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
