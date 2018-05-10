import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
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
                            Welcome to Hippocrates!
                        </h4>
                    </div>
                    <div className="col-md-12 top15">
                        <Link
                            to='/patient-profile'
                            className="btn btn-default btn-primary btn-welcome">
                            I am a patient
                        </Link>
                    </div>
                    <div className="col-md-12 top15">
                      <Link
                          to='/cases/open'
                            className="btn btn-default btn-primary btn-welcome">
                        I am a physician
                      </Link>
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
