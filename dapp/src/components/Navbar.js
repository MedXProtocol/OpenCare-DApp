import React, { Component } from 'react'
import classnames from 'classnames'
import { withRouter, Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import logo from '../assets/img/logo.png'
import './Navbar.css'
import { isDoctor } from '@/utils/web3-util'

class Navbar extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    isDoctor().then((isdoc) => {
      this.setState({
        isDoctor: isdoc
      })
    })
  }

  render() {

    if (this.state.isDoctor) {
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
}

Navbar.propTypes = {
    transparent: PropTypes.bool
};

Navbar.defaultProps = {
    transparent: false
};


export default withRouter(Navbar);
