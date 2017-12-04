import React, { Component } from 'react';

class Challenges extends Component {
    render() {
        return (
            <div className="card card-new-case">
                <div className="card-header">
                    <h4 className="card-title">My Challenges</h4>
                    <p className="category">Cases diagnosed by you that were challenged by patients</p>
                </div>
                <div className="card-content">
                    <div className="row">
                        <div className="col text-center">
                            <button 
                                type="button" 
                                className="btn btn-primary btn-fill"
                                disabled="true">
                                See My Challenges
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    );
  }
}

export default Challenges;