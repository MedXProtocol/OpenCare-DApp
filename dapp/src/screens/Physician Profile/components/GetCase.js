import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { getNextCaseFromQueue } from '../../../utils/web3-util';
import './GetCase.css';

class GetCase extends Component {
    navigateToDiagnoseCaseScreen = async () => {
        const nextCaseAddress = await getNextCaseFromQueue();
        
        if(nextCaseAddress == null) {

        } else {
            this.props.history.push('/diagnose-case/' + nextCaseAddress);
        }
    }
  
    render() {
        return (
            <div className="card card-new-case">
                <div className="card-header">
                    <h4 className="card-title">Next Case</h4>
                    <p className="category">Click button to get the next case</p>
                </div>
                <div className="card-content">
                    <div className="row">
                        <div className="col text-center">
                            <button 
                                type="button" 
                                className="btn btn-primary btn-fill"
                                onClick={() => this.navigateToDiagnoseCaseScreen()}>
                                Diagnose Next Case
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    );
  }
}

export default withRouter(GetCase);