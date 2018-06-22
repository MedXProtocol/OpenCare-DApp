import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withSaga, cacheCallValue } from '~/saga-genesis'
import { cacheCall, addContract } from '~/saga-genesis/sagas'
import { connect } from 'react-redux'

function mapStateToProps(state, { caseAddress }) {
  const status = (cacheCallValue(state, caseAddress, 'status') || '0')
  return {
    status
  }
}

function* saga({ caseAddress }) {
  yield addContract({address: caseAddress, contractKey: 'Case'})
  yield cacheCall(caseAddress, 'status')
}

const CaseStatus = connect(mapStateToProps)(withSaga(saga, { propTriggers: ['caseAddress'] })(class _CaseStatus extends Component {
    render() {
      var status = parseInt(this.props.status, 10)
      let alert
      switch (status) {
        case 1:
          alert =
            <div className="alert alert-info">
              Your case is waiting to be assigned to a doctor.
            </div>
          break
        case 2:
          alert =
            <div className="alert alert-danger">
              You have cancelled this case.
            </div>
          break
        case 3:
          alert =
            <div className="alert alert-warning">
              A doctor has requested to diagnose your case.  Please authorize the diagnosis.
            </div>
          break
        case 4:
          alert =
            <div className="alert alert-info">
                A doctor is currently diagnosing your case.
            </div>
          break
        case 5:
          alert =
            <div className="alert alert-warning">
                Your case has been evaluated.  Please review it.
            </div>
          break
        case 6:
          alert =
            <div className="alert alert-success">
                Your case has been successfully diagnosed and closed.
            </div>
          break
        case 7:
          alert =
            <div className="alert alert-info">
                You challenged the case. The case has been submitted for review by another doctor.
            </div>
          break
        case 8:
          alert =
            <div className="alert alert-success">
                A doctor has requested to challenge the existing diagnoses.  Please authorize the challenge diagnosis.
            </div>
          break
        case 9:
          alert =
            <div className="alert alert-info">
                Your case is under review by a second doctor.
            </div>
          break
        case 10:
          alert =
            <div className="alert alert-warning">
                You have received two different diagnoses from separate doctors. Please review both diagnoses and recommendations below. You have been refunded 10 MEDX and may consider re-submitting your case to the network or visiting your local dermatologist.
            </div>
          break
        case 11:
          alert =
            <div className="alert alert-warning">
                You have received the same diagnosis from separate doctors. Please review both recommendations below. A total of 15 MEDX was charged for your first opinion and discounted second opinion.
            </div>
          break
        default:
          alert = <div />
      }
      return alert
    }
}))

CaseStatus.propTypes = {
    caseAddress: PropTypes.string.isRequired
};

export default CaseStatus;
