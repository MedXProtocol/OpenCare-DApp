import React, { Component } from 'react'
import classnames from 'classnames'
import { Modal } from 'react-bootstrap'
import { withRouter, Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import logo from '../assets/img/logo.png'
import './Navbar.css'
import { isDoctor } from '@/utils/web3-util'
import { isSignedIn, signOut } from '@/services/sign-in'
import get from 'lodash.get'
import networkIdToName from '@/utils/network-id-to-name'
import { connect } from 'react-redux'
import { withContractRegistry, cacheCallValue, withSaga } from '@/saga-genesis'
import { cacheCall } from '@/saga-genesis/sagas'
import { contractByName } from '@/saga-genesis/state-finders'

function mapStateToProps (state) {
  const account = get(state, 'sagaGenesis.accounts[0]')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const isDoctor = cacheCallValue(state, DoctorManager, 'isDoctor', account)
  const networkId = get(state, 'sagaGenesis.network.networkId')
  return {
    account,
    isDoctor,
    networkId,
    DoctorManager
  }
}

function* saga({ account, DoctorManager }) {
  if (!DoctorManager) { return }
  yield cacheCall(DoctorManager, 'isDoctor', account)
}

const Navbar = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['account', 'DoctorManager'] })(class _Navbar extends Component {
  signOut = () => {
    signOut()
    this.props.history.push('/')
  }

  render() {
    var isDoctor = this.props.isDoctor

    if (isSignedIn()) {
      var signOut =
        <a className="navbar-text navbar-right btn-magnify" href='javascript:;' onClick={this.signOut}>
          Sign Out
        </a>
    }

    if (this.props.networkId) {
      var networkName = `${networkIdToName(this.props.networkId)} Network`
      if (!/(Ropsten)|(Localhost)/.test(networkName)) {
        var showNetworkModal = true
      }
    }

    if (isDoctor) {
      var casesItem =
        <Link to='/cases/open' className="navbar-text navbar-right btn-magnify">
          Open Cases
        </Link>
    }
        return (
            <nav id="mainNav" className={classnames('navbar', { 'navbar-transparent': this.props.transparent, 'navbar-absolute': this.props.transparent, 'navbar-default': !this.props.transparent})}>
                <div className="container">
                    <div className="navbar-header">
                        <Link to='/' className="navbar-brand" id="collNav" href="">
                            <img src={logo} alt="MedCredits"></img>
                        </Link>
                        <p className='navbar-text'>{networkName}</p>
                        <Link to='/wallet' id="wallet-link-toggle" className="navbar-toggle collapsed ti-wallet">
                            <span className="sr-only">Toggle</span>
                        </Link>
                    </div>
                    <div className="collapse navbar-collapse">
                        {signOut}
                        <Link to='/wallet' className="navbar-text navbar-right btn-magnify">
                            <i className="ti-wallet"></i>
                            &nbsp; My Wallet
                        </Link>
                        <Link to='/doctors' className="navbar-text navbar-right btn-magnify">
                            &nbsp; Doctors
                        </Link>
                        {casesItem}
                    </div>
                </div>
                <Modal show={showNetworkModal}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col text-center">
                                <h4>You must switch to the Ropsten network</h4>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </nav>
        );
    }
})))

Navbar.propTypes = {
    transparent: PropTypes.bool
};

Navbar.defaultProps = {
    transparent: false,
    accounts: []
};

export default withRouter(Navbar)
