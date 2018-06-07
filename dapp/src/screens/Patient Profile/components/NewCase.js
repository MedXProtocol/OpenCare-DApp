import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faFileMedical from '@fortawesome/fontawesome-free-solid/faFileMedical';

class NewCase extends Component {
  navigateToNewCaseScree = () => {
    this.props.history.push('/new-case');
  }

  render() {
    return (
      <div className="card">
        <div className="card-body text-right">
          <button
            type="button"
            className="btn btn-lg btn-success"
            onClick={() => this.navigateToNewCaseScree()}>
            <FontAwesomeIcon icon={faFileMedical} />
            <i className="fa fa-file-medical" aria-hidden="true"></i>
            &nbsp; Start New Case
          </button>
        </div>
      </div>
    );
  }
}

export default withRouter(NewCase);
