import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom'
import logo from './assets/images/logo.png'
import Home from './screens/Home'
import Patient from './screens/Patient'
import NewCase from './screens/New Case'
import Doctor from './screens/Doctor'
import {getSelectedAccount} from './utils/web3-util'
import './App.css'

class App extends Component {
    constructor(){
        super()

        this.state = {
            selectedAccount: ''
        };
    }

    componentDidMount(){
        this.setState({selectedAccount: getSelectedAccount()});
    }

    render(){
        return (
            <div className="MedCredits">
            <nav id="mainNav" className="navbar navbar-default">
                <div className="container">
                    <div className="navbar-header">
                        <a className="navbar-brand" id="collNav" href="/">
                            <img src={logo} alt="MedCredits"></img> 
                        </a>
                    </div>
                    <p className="navbar-text navbar-right">Signed in with account <span>{this.state.selectedAccount}</span>
                    </p>
                </div>
            </nav>
            <BrowserRouter>
                <div>
                    <Route exact path='/' component={Home}/>
                    <Route path='/patient' component={Patient}/>
                    <Route path='/new-case' component={NewCase}/>
                    <Route path='/doctor' component={Doctor}/>
                </div>
            </BrowserRouter>
            </div>
        );
    }
}

export default App;