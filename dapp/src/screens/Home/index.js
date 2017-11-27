import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class Home extends Component {
  navigateToPatientScreen(){
    this.props.history.push('/patient');
  }

  navigateToDoctorScreen = () => {
    this.props.history.push('/doctor');
  }
  
  render() {
    return (
      <section className="container home">
        <div className="row">
          <div className="col">
            <button 
              type="button" 
              className="btn btn-default"
              onClick={() => this.navigateToDoctorScreen()}>
            I'm doctor
            </button>
          </div>
          <div className="col">
            <button 
              type="submit" 
              className="btn btn-fill btn-info"
              onClick={() => this.navigateToPatientScreen()}>
            Sign in
            </button>
          </div>
        </div>
      </section>
    );
  }
}

export default withRouter(Home);
