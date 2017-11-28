import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './screens/Home';
import PatientProfile from './screens/Patient Profile';
import NewCase from './screens/New Case';
import PatientCase from './screens/Patient Case';
import PhysicianProfile from './screens/Physician Profile';
import DiagnoseCase from './screens/Diagnose Case';
import AddDoctor from './screens/Add Doctor';
import Balance from './screens/Balance';
import './App.css';

class App extends Component {
    

    render(){
        return (
            <div className="wrapper">
                <div className="main-panel">
                    <Navbar />
                    <div className="content">
                        <BrowserRouter>
                            <div>
                                <Route exact path='/' component={Home}/>
                                <Route exact path='/new-case' component={NewCase}/>
                                <Route exact path='/patient-case/:caseAddress' component={PatientCase}/>
                                <Route exact path='/patient-profile' component={PatientProfile}/>
                                <Route exact path='/physician-profile' component={PhysicianProfile}/>
                                <Route exact path='/diagnose-case/:caseAddress' component={DiagnoseCase}/>
                                <Route exact path='/doctors' component={AddDoctor}/>
                                <Route exact path='/balance' component={Balance}/>
                            </div>
                        </BrowserRouter>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;