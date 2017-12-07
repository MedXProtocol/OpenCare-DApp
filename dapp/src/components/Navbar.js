import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import logo from '../assets/img/logo.png';
import './Navbar.css';

class Navbar extends Component {
    navigateToHomeScreen = (event) => {
        event.preventDefault();
        
        this.props.history.push('/');
    }
    
      navigateToWalletScreen = (event) => {
        event.preventDefault();

        this.props.history.push('/wallet');
      }
    
    getClass = () => {
        if(this.props.transparent) {
            return "navbar navbar-transparent navbar-absolute";
        }

        return "navbar navbar-default";
    }
    
    render() {
        return (
            <nav id="mainNav" className={this.getClass()}>
                <div className="container">
                    <div className="navbar-header">
                        <a onClick={this.navigateToHomeScreen} className="navbar-brand" id="collNav" href="">
                            <img src={logo} alt="MedCredits"></img> 
                        </a>
                        <a onClick={this.navigateToWalletScreen} id="wallet-link-toggle" className="navbar-toggle collapsed ti-wallet" href="" >
                            <span className="sr-only">Toggle</span>
                        </a>
                    </div>
                    <div className="collapse navbar-collapse">
                        <a onClick={this.navigateToWalletScreen} id="wallet-link" className="navbar-text navbar-right btn-magnify"  href="">
                            <i className="ti-wallet"></i>
                            &nbsp; My Wallet
                        </a>
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