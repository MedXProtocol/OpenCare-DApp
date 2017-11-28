import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class NewCase extends Component {
    navigateToNewCaseScree = () => {
    this.props.history.push('/new-case');
    }
  
    render() {
        return (
            <div className="card">
                <div className="card-header">
                    <h4 className="card-title">New Case</h4>
                    <p className="category">Click button to create new case</p>
                </div>
                <div className="card-content">
                    <div className="row">
                        <div className="col text-center">
                            <button 
                                type="button" 
                                className="btn btn-primary btn-fill"
                                onClick={() => this.navigateToNewCaseScree()}>
                                Start New Case
                            </button>
                        </div>
                    </div>
                </div>
                <div className="card-footer">
                    {/* <hr/> */}
                </div>
            </div>
    );
  }
}

export default withRouter(NewCase);