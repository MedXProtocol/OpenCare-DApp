import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Welcome from './components/Welcome';
import './index.css';

class Home extends Component {
  navigateToPatientScreen(){
    this.props.history.push('/patient');
  }

  navigateToDoctorScreen = () => {
    this.props.history.push('/doctor');
  }
  
  render() {
    return (
      <div>
        <div className="alert alert-warning alert-top">
          This application is in alpha and is not intended to be used for clinical purposes. 
          Any diagnoses received are not from certified physicians. 
          By submitting a transaction on this application, you are verifying that you have read and understood this disclaimer.
        </div>
        <Navbar transparent={ true } />
        <div className="wrapper wrapper-full-page wrapper-home-page">
          <div className="fullpage lock-page" >
            <div className="content">
              <Welcome />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Home);


