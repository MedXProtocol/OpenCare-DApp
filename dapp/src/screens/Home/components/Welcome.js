import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './Welcome.css';

class Welcome extends Component {
  navigateToPatientScreen(){
    this.props.history.push('/patient-profile');
  }

  navigateToDoctorScreen = () => {
    this.props.history.push('/physician-profile');
  }
  
  render() {
    return (
        <div className="card card-lock">
            <div className="card-content">
                <div className="row">
                    <div className="col-md-12">
                        <h4>
                            Welcome!
                        </h4>
                    </div>
                    <div className="col-md-12">
                        <button 
                            type="button" 
                            className="btn btn-default btn-primary btn-welcome"
                            onClick={() => this.navigateToPatientScreen()}>
                            I am patient
                        </button>
                    </div>
                    <div className="col-md-12 top5">
                        <button 
                            type="submit" 
                            className="btn btn-default btn-primary btn-welcome"
                            onClick={() => this.navigateToDoctorScreen()}>
                        I am physician
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-footer">
            </div>
        </div>
    );
  }
}

export default withRouter(Welcome);