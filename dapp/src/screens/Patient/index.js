import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'


class Patient extends Component {
  navigateToNewCaseScree = () => {
    this.props.history.push('/new-case');
  }
  
  render() {
    return (
      <div>
        <h1>Patient view</h1>
        <div>
          <button 
              type="button" 
              className="btn btn-default"
              onClick={() => this.navigateToNewCaseScree()}>
            New Case
            </button>
        </div>
      </div>
    );
  }
}

export default withRouter(Patient);
