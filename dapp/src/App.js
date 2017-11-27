import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './screens/Home';
import PatientProfile from './screens/Patient Profile';
import NewCase from './screens/New Case';
import Doctor from './screens/Doctor';
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
                                <Route path='/patient-profile' component={PatientProfile}/>
                                <Route path='/new-case' component={NewCase}/>
                                <Route path='/doctor' component={Doctor}/>
                                <Route path='/doctors' component={AddDoctor}/>
                                <Route path='/balance' component={Balance}/>
                            </div>
                        </BrowserRouter>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;