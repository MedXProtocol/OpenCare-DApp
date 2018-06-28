import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { ErrorModal } from '~/components/ErrorModal'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faFileMedical from '@fortawesome/fontawesome-free-solid/faFileMedical';
import { connect } from 'react-redux'
import { contractByName } from '~/saga-genesis/state-finders'
import { cacheCall, withSaga, cacheCallValue } from '~/saga-genesis'
import * as routes from '~/config/routes'

function mapStateToProps(state, ownProps) {
  const account = state.sagaGenesis.accounts[0]
  const AccountManager = contractByName(state, 'AccountManager')
  const publicKey = cacheCallValue(state, AccountManager, 'publicKeys', account)
  return {
    account,
    publicKey
  }
}

function* saga({ account, AccountManager }) {
  if (!account || !AccountManager) { return }
  yield cacheCall(AccountManager, 'publicKeys', account)
}

export const PatientDashboardHeader = connect(mapStateToProps)(withSaga(saga, { propTriggers: ['account', 'AccountManager'] })(class _PatientDashboardHeader extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showPublicKeyModal: false
    }
  }

  navigateToNewCase = () => {
    if (!this.props.publicKey) {
      this.setState({showPublicKeyModal: true})
    } else {
      this.props.history.push(routes.PATIENTS_CASES_NEW)
    }
  }

  render() {
    return (
      <div className="header-card card">
        <ErrorModal
          show={this.state.showPublicKeyModal}
          onHide={() => this.setState({showPublicKeyModal: false})}>
          <div className='row'>
            <div className='col-sm-12'>
              <p>
                Your account has not yet been set up.  You must wait until your account has been
              saved to the blockchain.
              </p>
            </div>
          </div>
        </ErrorModal>
        <div className='card-body'>
          <div className='row'>
            <div className='col-md-8 col-sm-12'>
              <h3 className="title">
                My Cases
              </h3>
              <span className="sm-block text-gray">
                <strong>Current &amp; Historical</strong>
              </span>
            </div>
            <div className='col-md-4 col-sm-12 button-container'>
              <button
                type="button"
                className="btn btn-lg btn-success"
                onClick={this.navigateToNewCase}
              >
                <FontAwesomeIcon
                  icon={faFileMedical}
                  size='lg'
                />
                &nbsp; Start New Case
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}))

export const PatientDashboardHeaderContainer = withRouter(PatientDashboardHeader)
