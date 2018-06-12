import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faFileMedical from '@fortawesome/fontawesome-free-solid/faFileMedical';

class NewCase extends Component {
  navigateToNewCase = () => {
    this.props.history.push('/patients/cases/new');
  }

  render() {
    return (
      <div className="header-card card">
        <div className='card-body'>
          <div className='row'>
            <div className='col-md-8 col-sm-12'>
              <h3 className="title">
                My Cases
              </h3>
              <span className="sm-block text-gray">
                <strong>Current &amp; Previously Evaluated</strong>
              </span>
            </div>
            <div className='col-md-4 col-sm-12 button-container'>
              <button
                type="button"
                className="btn btn-lg btn-success"
                onClick={() => this.navigateToNewCase()}>
                <FontAwesomeIcon
                  icon={faFileMedical}
                  size='lg' />
                <i className="fa fa-file-medical" aria-hidden="true"></i>
                &nbsp; Start New Case
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(NewCase);
