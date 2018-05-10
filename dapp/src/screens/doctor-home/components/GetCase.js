import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import Spinner from '../../../components/Spinner';
import { getNextCaseFromQueue } from '../../../utils/web3-util';
import './GetCase.css';

class GetCase extends Component {
    constructor(){
        super()

        this.state = {
            showNoCasesModal: false,
            actionInProgress: false
        };
    }
    
    navigateToDiagnoseCaseScreen = async () => {
        this.setState({actionInProgress: true});
        const nextCaseAddress = await getNextCaseFromQueue();
        this.setState({actionInProgress: false});
        
        if(nextCaseAddress == null) {
            this.setState({showNoCasesModal: true});
        } else {
            this.props.history.push('/diagnose-case/' + nextCaseAddress);
        }
    }

    handleCloseNoCaseModal = (event) => {
        event.preventDefault();
        
        this.setState({showNoCasesModal: false});
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
                <Modal show={this.state.showNoCasesModal}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col text-center">
                                <h4>There are no cases in the queue.</h4>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={this.handleCloseNoCaseModal} type="button" className="btn btn-defult">OK</button>
                    </Modal.Footer>
                </Modal>
                <Spinner loading={this.state.actionInProgress}/>
            </div>
    );
  }
}

export default withRouter(GetCase);