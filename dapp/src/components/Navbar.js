import React, { Component } from 'react';
import logo from '../assets/img/logo.png';
import './Navbar.css';

class Navbar extends Component {
    render() {
        return (
            <nav id="mainNav" className="navbar navbar-default">
                <div className="container">
                    <div className="navbar-header">
                        <a className="navbar-brand" id="collNav" href="/">
                            <img src={logo} alt="MedCredits"></img> 
                        </a>
                    </div>
                </div>
            </nav>
        );
    }
}

export default Navbar;