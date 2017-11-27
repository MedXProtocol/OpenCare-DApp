import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Welcome from './components/Welcome';

class Home extends Component {
  navigateToPatientScreen(){
    this.props.history.push('/patient');
  }

  navigateToDoctorScreen = () => {
    this.props.history.push('/doctor');
  }
  
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col">
            <Welcome />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Home);
