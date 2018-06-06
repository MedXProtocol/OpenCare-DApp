import React, { Component } from 'react';
import './Challenges.css';

class Challenges extends Component {
    render() {
        return (
            <div className="card card-new-case">
                <div className="card-body">
                    <div className="row">
                        <div className="col-xs-12 text-center">
                            <button
                                type="button"
                                className="btn btn-primary btn-fill btn-challenged-cases"
                                disabled="true">
                                See Challenged Cases
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    );
  }
}

export default Challenges;
