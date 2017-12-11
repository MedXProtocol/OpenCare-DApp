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
            <div className="card card-new-case padding10">
                <div className="card-content">
                    <div className="row">
                        <div className="col text-center">
                            <button 
                                type="button" 
                                className="btn btn-primary btn-fill btn-next-case"
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