import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { HippoNavbarContainer } from '~/components/HippoNavbar'
import { PublicKeyCheck } from '~/components/PublicKeyCheck'
import { BetaFaucetModal } from '~/components/BetaFaucetModal'
import { NetworkCheckModal } from '~/components/NetworkCheckModal'
import { ScrollyFeedbackLink } from '~/components/ScrollyFeedbackLink'
import get from 'lodash.get'
import { cacheCallValue, contractByName } from '~/saga-genesis/state-finders'
import { withSaga } from '~/saga-genesis'
import { cacheCall } from '~/saga-genesis/sagas'

function mapStateToProps (state) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const isOwner = address && (cacheCallValue(state, DoctorManager, 'owner') === address)
  const isSignedIn = get(state, 'account.signedIn')
  return {
    DoctorManager,
    isOwner,
    isSignedIn
  }
}

function* saga({ DoctorManager }) {
  if (!DoctorManager) { return }
  yield cacheCall(DoctorManager, 'owner')
}

export const MainLayout = withSaga(saga, { propTriggers: ['DoctorManager'] })(class extends Component {
  static propTypes = {
    doNetworkCheck: PropTypes.bool,
    doPublicKeyCheck: PropTypes.bool,
    doBetaFaucetModal: PropTypes.bool
  }

  static defaultProps = {
    doNetworkCheck: true,
    doPublicKeyCheck: true,
    doBetaFaucetModal: true
  }

  render() {
    if (this.props.doNetworkCheck) {
      var networkCheckmodal = <NetworkCheckModal />
    }
    if (this.props.doPublicKeyCheck) {
      var publicKeyCheck = <PublicKeyCheck />
    }
    if (this.props.doBetaFaucetModal) {
      var betaFaucetModal = <BetaFaucetModal />
    }
    if (this.props.isOwner) {
      var ownerWarning =
        <div className="alert alert-warning alert--banner text-center">
          <small>NOTE: You are currently using the contract owner's Ethereum address, please do not submit or diagnose cases with this account for encryption reasons.</small>
        </div>
    }
    if (this.props.isSignedIn) {
      var feedbackLink = (
        <ScrollyFeedbackLink scrollDiffAmount={50} />
      )
    }
    return (
      <div className="wrapper">
        <div className="main-panel">
          <HippoNavbarContainer />
          {ownerWarning}
          {networkCheckmodal}
          <div className="content">
            {publicKeyCheck}
            {betaFaucetModal}

            {this.props.children}
          </div>

          {feedbackLink}
        </div>
        <footer className="footer">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 text-center">
                <p className="text-footer">
                  &copy; 2018 MedCredits Inc. - All Rights Reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }
})

export const MainLayoutContainer = connect(mapStateToProps)(MainLayout)
