import React, { Component } from 'react'
import classnames from 'classnames'
import { withRouter, Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import logo from '../assets/img/logo.png'
import './Navbar.css'
import { isDoctor } from '@/utils/web3-util'
import { isSignedIn, signOut } from '@/services/sign-in'
import get from 'lodash.get'
import { connect } from 'react-redux'
import { withContractRegistry, cacheCallValue, withSaga } from '@/saga-genesis'
import { cacheCall } from '@/saga-genesis/sagas'

function mapStateToProps (state, { contractRegistry }) {
  const account = get(state, 'sagaGenesis.accounts[0]')
  const doctorManager = contractRegistry.requireAddressByName('DoctorManager')
  const isDoctor = cacheCallValue(state, doctorManager, 'isDoctor', account)
  return {
    account,
    isDoctor
  }
}

function* saga({ account }, { contractRegistry }) {
  const doctorManager = contractRegistry.requireAddressByName('DoctorManager')
  yield cacheCall(doctorManager, 'isDoctor', account)
}

const Navbar = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: 'account' })(class _Navbar extends Component {
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
