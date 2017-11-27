import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './screens/Home';
import Patient from './screens/Patient';
import NewCase from './screens/New Case';
import Doctor from './screens/Doctor';
import AddDoctor from './screens/Add Doctor';
import Balance from './screens/Balance';
import './App.css';

class App extends Component {
    

    render(){
        return (
            <div>
                <Navbar />
                <BrowserRouter>
                    <div>
                        <Route exact path='/' component={Home}/>
                        <Route path='/patient' component={Patient}/>
                        <Route path='/new-case' component={NewCase}/>
                        <Route path='/doctor' component={Doctor}/>
                        <Route path='/doctors' component={AddDoctor}/>
                        <Route path='/balance' component={Balance}/>
                    </div>
                </BrowserRouter>
            </div>
        );
    }
}

export default App;