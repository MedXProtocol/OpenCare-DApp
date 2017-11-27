import React, { Component } from 'react';
import logo from '../assets/img/logo.png';
import {getSelectedAccount} from '../utils/web3-util';
import './Navbar.css';

class Navbar extends Component {
    constructor(){
        super()

        this.state = {
            selectedAccount: ''
        };
    }

    componentDidMount(){
        this.setState({selectedAccount: getSelectedAccount()});
    }
  
    render() {
        return (
            <nav id="mainNav" className="navbar navbar-default">
                <div className="container">
                    <div className="navbar-header">
                        <a className="navbar-brand" id="collNav" href="/">
                            <img src={logo} alt="MedCredits"></img> 
                        </a>
                    </div>

                    <p className="navbar-text navbar-right">
                        {this.state.selectedAccount}
                    </p> 
                </div>
            </nav>
        );
    }
}

export default Navbar;