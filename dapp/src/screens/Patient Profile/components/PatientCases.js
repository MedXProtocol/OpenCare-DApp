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
  
    render() {
        return (
            <div className="card">
                <div className="card-header">
                    <h4 className="card-title">Cases</h4>
                    <p className="category">All of the cases that you previously submitted</p>
                </div>
                <div className="card-content table-responsive">
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
                    <a href="#" rel="tooltip" title="" className="btn btn-success btn-simple" data-original-title="Edit Profile">
                        <i className="ti-pencil-alt"></i>
                    </a>
                </td>
            </tr>
        );
      }
}

export default withRouter(PatientCases);