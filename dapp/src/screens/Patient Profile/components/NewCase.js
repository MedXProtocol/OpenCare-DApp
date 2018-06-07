import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './NewCase.css';

class NewCase extends Component {
    navigateToNewCaseScree = () => {
        this.props.history.push('/new-case');
    }

    render() {
        return (
            <div className="card card-new-case">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-12 text-center">
                            <button
                                type="button"
                                className="btn btn-primary btn-new-case"
                                onClick={() => this.navigateToNewCaseScree()}>
                                Start New Case
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    );
  }
}

export default withRouter(NewCase);
