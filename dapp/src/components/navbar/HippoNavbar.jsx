import React, { Component } from 'react'
import classnames from 'classnames'
import { all } from 'redux-saga/effects'
import { toastr } from '~/toastr'
import {
  Nav,
  Navbar,
  NavItem,
  NavDropdown,
  MenuItem
} from 'react-bootstrap'
import {
  IndexLinkContainer,
  LinkContainer
} from 'react-router-bootstrap'
import { withRouter, Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import ReactTooltip from 'react-tooltip'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faUserCircle from '@fortawesome/fontawesome-free-solid/faUserCircle';
import logo from '~/assets/img/logo.png'
import get from 'lodash.get'
import networkIdToName from '~/utils/network-id-to-name'
import { connect } from 'react-redux'
import {
  cacheCall,
  withContractRegistry,
  withSaga,
  cacheCallValue,
  contractByName
} from '~/saga-genesis'
import { HippoCasesRequiringAttention } from './HippoCasesRequiringAttention'
import { CurrentTransactionsList } from '~/components/CurrentTransactionsList'
import { Ether } from '~/components/Ether'
import * as routes from '~/config/routes'

function mapStateToProps (state) {
  let doctorName
  const address = get(state, 'sagaGenesis.accounts[0]')
  const isAvailable = get(state, 'heartbeat.isAvailable')
  const isSignedIn = get(state, 'account.signedIn')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const WrappedEther = contractByName(state, 'WrappedEther')
  const isDoctor = cacheCallValue(state, DoctorManager, 'isDoctor', address)
  const canRegister = cacheCallValue(state, DoctorManager, 'owner') === address
  const balance = cacheCallValue(state, WrappedEther, 'balanceOf', address)
  const networkId = get(state, 'sagaGenesis.network.networkId')
  const signedIn = state.account.signedIn

  if (isDoctor) {
    doctorName = cacheCallValue(state, DoctorManager, 'name', address)
  }

  return {
    address,
    isAvailable,
    isSignedIn,
    balance,
    doctorName,
    isDoctor,
    networkId,
    DoctorManager,
    WrappedEther,
    signedIn,
    canRegister
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatchSignOut: () => {
      dispatch({ type: 'SIGN_OUT' })
    },
    dispatchShowBetaFaucetModal: () => {
      dispatch({ type: 'SHOW_BETA_FAUCET_MODAL', manuallyOpened: true })
    },
    dispatchAvailabilityChange: (isAvailable) => {
      dispatch({ type: 'AVAILABILITY_CHANGED', isAvailable })
    }
  }
}

function* saga({ address, DoctorManager, WrappedEther }) {
  if (!address || !DoctorManager || !WrappedEther) { return }
  yield all([
    cacheCall(WrappedEther, 'balanceOf', address),
    cacheCall(DoctorManager, 'owner'),
    cacheCall(DoctorManager, 'isDoctor', address),
    cacheCall(DoctorManager, 'name', address)
  ])
}

export const HippoNavbar = withContractRegistry(
  connect(mapStateToProps, mapDispatchToProps)(
    withSaga(saga)(
      class _HippoNavbar extends Component {

  constructor(props) {
    super(props)

    this.state = {
      profileMenuOpen: false,
      adminMenuOpen: false
    }
  }

  signOut = () => {
    this.props.dispatchSignOut()
    this.props.history.push(routes.SIGN_IN)
  }

  toggleProfileMenu = (value) => {
    this.setState({ profileMenuOpen: value  })
  }

  handleBetaFeaturesClick = (event) => {
    event.preventDefault()
    this.props.dispatchShowBetaFaucetModal()
    this.toggleProfileMenu(false)
  }

  handleToggleIsAvailable = () => {
    const isAvailable = !this.props.isAvailable
    if (isAvailable) {
      toastr.success('You are now online and will be prioritized to diagnose cases.')
    } else {
      toastr.warning('You are now offline and will not be prioritized to diagnose cases.')
    }
    this.props.dispatchAvailabilityChange(isAvailable)
  }

  render() {
    const { isDoctor, isSignedIn } = this.props
    const nameOrAccountString = this.props.doctorName ? this.props.doctorName : 'Account'

    if (this.props.signedIn && this.props.address) {
      var profileMenu =
        <NavDropdown
          title={nameOrAccountString}
          id='account-dropdown'
          open={this.state.profileMenuOpen}
          onToggle={(value) => this.toggleProfileMenu(value)}

        >
          <MenuItem header>Profile</MenuItem>

          <LinkContainer to={routes.ACCOUNT_WALLET}>
            <MenuItem href={routes.ACCOUNT_WALLET}>
              W-ETH Balance
            </MenuItem>
          </LinkContainer>

          <li role="presentation">
            <a role="menuitem" onClick={this.handleBetaFeaturesClick}>
              Beta Features
            </a>
          </li>

          <MenuItem header>Security</MenuItem>
          <LinkContainer to={routes.ACCOUNT_EMERGENCY_KIT}>
            <MenuItem href={routes.ACCOUNT_EMERGENCY_KIT}>
              Emergency Kit
            </MenuItem>
          </LinkContainer>
          <LinkContainer to={routes.ACCOUNT_CHANGE_PASSWORD}>
            <MenuItem href={routes.ACCOUNT_CHANGE_PASSWORD}>
              Change Password
            </MenuItem>
          </LinkContainer>

          <MenuItem divider />
          <MenuItem onClick={this.signOut}>
            Sign Out
          </MenuItem>
        </NavDropdown>

      var wrappedEtherBalance =
        <LinkContainer to={routes.ACCOUNT_WALLET}>
          <NavItem href={routes.ACCOUNT_WALLET}>
            <Ether wei={this.props.balance} noStyle />
          </NavItem>
        </LinkContainer>

      var myCasesItem =
        <IndexLinkContainer to={routes.PATIENTS_CASES}  activeClassName="active">
          <NavItem href={routes.PATIENTS_CASES}>
            My Cases
          </NavItem>
        </IndexLinkContainer>

      if (isDoctor) {
        var openCasesItem =
          <LinkContainer to={routes.DOCTORS_CASES_OPEN}>
            <NavItem href={routes.DOCTORS_CASES_OPEN}>
              <HippoCasesRequiringAttention /> Diagnose Cases
            </NavItem>
          </LinkContainer>
      }

      if (this.props.canRegister) {
        var adminItem =
          <NavDropdown
            title='Admin'
            id='admin-dropdown'
            open={this.state.adminMenuOpen}
            onToggle={(value) => this.setState({adminMenuOpen: !this.state.adminMenuOpen})}
          >
            <LinkContainer to={routes.ADMIN_DAPP_SETTINGS}>
              <MenuItem href={routes.ADMIN_DAPP_SETTINGS}>
                DApp Settings
              </MenuItem>
            </LinkContainer>
            <LinkContainer to={routes.DOCTORS_NEW}>
              <MenuItem href={routes.DOCTORS_NEW}>
                Doctors
              </MenuItem>
            </LinkContainer>
            <LinkContainer to={routes.ADMIN_FEES}>
              <MenuItem href={routes.ADMIN_FEES}>
                Fees
              </MenuItem>
            </LinkContainer>
          </NavDropdown>
      }
    }

    if (isDoctor && isSignedIn) {
      var statusItem =
        <NavItem onClick={this.handleToggleIsAvailable} className="nav--button">
          <span className={
              classnames(
                'nav--circle',
                this.props.isAvailable ? 'nav--circle__success' : 'nav--circle__danger'
              )
          }/>&nbsp;
          {this.props.isAvailable ? 'Online' : 'Offline'}
        </NavItem>
    }

    let navbarClassName = classnames(
      'navbar',
      'container--nav',
      {
        'navbar-transparent': this.props.transparent,
        'navbar-absolute': this.props.transparent,
        'navbar-default': !this.props.transparent
      }
    )

    return (
      <Navbar
        inverse
        collapseOnSelect
        id="mainNav"
        className={navbarClassName}>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to={routes.HOME} className="navbar-brand">
              <img src={logo} alt="MedCredits"></img>
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Nav className="nav--network-name">
          {this.props.canRegister ? (
            <NavItem>
              <FontAwesomeIcon
                icon={faUserCircle}
                size='sm'
                className='text-gold'
                data-tip='This Ethereum account is a Contract Owner' />
              <ReactTooltip effect='solid' place='bottom' />
            </NavItem>
          ) : null}
          <NavItem>
            {networkIdToName(this.props.networkId)} Network
          </NavItem>
        </Nav>
        <Navbar.Collapse>
          <Nav pullRight>
            <CurrentTransactionsList />
            {statusItem}
            {wrappedEtherBalance}
            {myCasesItem}
            {openCasesItem}
            {adminItem}
            {profileMenu}
          </Nav>
        </Navbar.Collapse>
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

export const HippoNavbarContainer = withRouter(HippoNavbar)
