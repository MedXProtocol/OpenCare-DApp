import React, { Component } from 'react'
import classnames from 'classnames'
import {
  Modal,
  Nav,
  Navbar,
  NavItem,
  NavDropdown,
  MenuItem
} from 'react-bootstrap'
import { withRouter, Link } from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'
import PropTypes from 'prop-types'
import logo from '../assets/img/logo.png'
import './Navbar.css'
import { isSignedIn, signOut } from '@/services/sign-in'
import get from 'lodash.get'
import networkIdToName from '@/utils/network-id-to-name'
import { connect } from 'react-redux'
import { cacheCall } from '@/saga-genesis/sagas'
import { withContractRegistry, withSaga } from '@/saga-genesis/components'
import { cacheCallValue, contractByName } from '@/saga-genesis/state-finders'

import { CurrentTransactionsList } from '@/components/CurrentTransactionsList'

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
  if (!account || !DoctorManager) { return }
  yield cacheCall(DoctorManager, 'isDoctor', account)
}

const HippoNavbar = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['account', 'DoctorManager', 'MedXToken'] })(class _HippoNavbar extends Component {
  signOut = () => {
    signOut()
    this.props.history.push('/')
  }

  render() {
    var isDoctor = this.props.isDoctor

    if (isSignedIn()) {
      var profileMenu =
        <NavDropdown title='My Account' id='my-account'>
          <LinkContainer to='/wallet'>
            <MenuItem href='/wallet'>
              My Balance
            </MenuItem>
          </LinkContainer>
          <LinkContainer to='/emergency-kit'>
            <MenuItem href='/emergency-kit'>
              My Emergency Kit
            </MenuItem>
          </LinkContainer>
          <MenuItem divider />
          <MenuItem href='javascript:;' onClick={this.signOut}>
            Sign Out
          </MenuItem>
        </NavDropdown>

      var myCasesItem =
        <LinkContainer to='/'>
          <NavItem href='/'>
            My Cases
          </NavItem>
        </LinkContainer>

      if (isDoctor) {
        var openCasesItem =
          <LinkContainer to='/cases/open'>
            <NavItem href='/cases/open'>
              Diagnose Cases
            </NavItem>
          </LinkContainer>
      }

      var doctorsItem =
        <LinkContainer to='/doctors'>
          <NavItem href='/doctors'>
            Doctors
          </NavItem>
        </LinkContainer>
    }

    if (this.props.networkId) {
      var networkName = `${networkIdToName(this.props.networkId)} Network`
      if (!/(Ropsten)|(Localhost)/.test(networkName)) {
        var showNetworkModal = true
      }
    }

    let navbarClassName = classnames('navbar', { 'navbar-transparent': this.props.transparent, 'navbar-absolute': this.props.transparent, 'navbar-default': !this.props.transparent})

    return (
      <Navbar
        inverse
        collapseOnSelect
        id="mainNav"
        className={navbarClassName}>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to='/' className="navbar-brand" id="collNav" href="">
              <img src={logo} alt="MedCredits"></img>
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Nav>
          <NavItem>
            {networkName}
          </NavItem>
        </Nav>
        <Navbar.Collapse>
          <Nav pullRight>
            <CurrentTransactionsList />
            {myCasesItem}
            {openCasesItem}
            {doctorsItem}
            {profileMenu}
          </Nav>
        </Navbar.Collapse>
        <Modal show={showNetworkModal}>
          <Modal.Body>
            <div className="row">
              <div className="col text-center">
                <h4>You must switch to the Ropsten network</h4>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </Navbar>
    );
  }
})))

HippoNavbar.propTypes = {
    transparent: PropTypes.bool
};

HippoNavbar.defaultProps = {
    transparent: false,
    accounts: []
};

export default withRouter(HippoNavbar)
