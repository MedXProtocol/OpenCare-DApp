import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Home from './screens/Home';
import PatientProfile from './screens/Patient Profile';
import NewCase from './screens/New Case';
import PatientCase from './screens/Patient Case';
import PhysicianProfile from './screens/Physician Profile';
import DiagnoseCase from './screens/Diagnose Case';
import AddDoctor from './screens/Add Doctor';
import Mint from './screens/Mint';
import Wallet from './screens/Wallet';
import './App.css';

class App extends Component {
    

    render(){
        return (
            <BrowserRouter>
                <div>
                    <Route exact path='/' component={ Home }/>
                    <Route exact path='/new-case' component={ NewCase }/>
                    <Route exact path='/patient-case/:caseAddress' component={ PatientCase }/>
                    <Route exact path='/patient-profile' component={ PatientProfile }/>
                    <Route exact path='/physician-profile' component={ PhysicianProfile }/>
                    <Route exact path='/diagnose-case/:caseAddress' component={ DiagnoseCase }/>
                    <Route exact path='/doctors' component={ AddDoctor }/>
                    <Route exact path='/mint' component={ Mint }/>
                    <Route exact path='/wallet' component={ Wallet }/>
                </div>
            </BrowserRouter>
        );
    }
}

export default App;