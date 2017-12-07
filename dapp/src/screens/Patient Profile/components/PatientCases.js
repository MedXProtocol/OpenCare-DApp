import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {getAllCasesForCurrentAccount} from '../../../utils/web3-util';

class PatientCases extends Component {
    constructor() {
        super()

        this.state = {
            cases: []
        };
    }
    
    async componentDidMount() {
        const cases = await getAllCasesForCurrentAccount();
        this.setState({cases: cases});
    }

    onCaseClick = (event) => {
        this.props.history.push('/patient-case/' + event.target.id);              
    }
  
    render() {
        return (
            <div className="card">
                <div className="card-header">
                    <h4 className="card-title">Cases</h4>
                    <p className="category">All of the cases that you previously submitted</p>
                </div>
                <div className="card-content table-responsive">
                {
                    this.state.cases.length === 0 ?
                    <div className="alert alert-info">
                        <span>You have not submitted any cases to MedCredits</span>
                    </div> :
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="text-center">#</th>
                                <th>Case Address</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.renderCases(this.state.cases)}
                        </tbody>
                    </table>
                }
                </div>
            </div>
        );
    }

    renderCases (cases) {
        return cases.map(c => 
            <tr key={c.address}>
                <td className="text-center">{c.number}</td>
                <td>{c.address}</td>
                <td>{c.statusName}</td>
                <td className="td-actions text-right">
                    <a id={c.address} onClick={this.onCaseClick} className="btn btn-success btn-simple ti-pencil-alt" >
                    </a>
                </td>
            </tr>
        );
      }
}

export default withRouter(PatientCases);