import React, { Component } from 'react';
import './Challenges.css';

class Challenges extends Component {
    render() {
        return (
            <div className="card card-new-case padding10">
                <div className="card-content">
                    <div className="row">
                        <div className="col text-center">
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