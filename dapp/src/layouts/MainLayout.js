import React, { Component } from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { HippoNavbarContainer } from '../components/HippoNavbar';
import { NetworkCheckModal } from '~/components/NetworkCheckModal'
import get from 'lodash.get'
import { cacheCallValue, contractByName } from '~/saga-genesis/state-finders'

function mapStateToProps (state) {
  const account = get(state, 'sagaGenesis.accounts[0]')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const isOwner = account && (cacheCallValue(state, DoctorManager, 'owner') === account)
  return {
    isOwner
  }
}

export const MainLayout = class extends Component {
  static propTypes = {
    doNetworkCheck: PropTypes.bool
  }

  static defaultProps = {
    doNetworkCheck: true
  }

  render() {
    if (this.props.doNetworkCheck) {
      var networkCheckmodal = <NetworkCheckModal />
    }
    return (
      <div className="wrapper">
        <div className="main-panel">
          <HippoNavbarContainer />
          {this.props.isOwner ? (
            <div className="alert alert-warning alert--banner text-center">
              <small>NOTE: You are currently using the contract owner's Ethereum address, please do not submit or diagnose cases with this account for encryption reasons.</small>
            </div>
          ) : null}
          {networkCheckmodal}
          <div className="content">{this.props.children}</div>
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
}

export const MainLayoutContainer = connect(mapStateToProps)(MainLayout)
