import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class PatientCases extends Component {
  render() {
    return (
        <div className="card">
            <div className="card-header">
                <h4 className="card-title">Your Cases</h4>
                <p class="category">All of the cases that you previously submitted</p>
            </div>
            <div className="card-content table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="text-center">#</th>
                            <th>Name</th>
                            <th>Job Position</th>
                            <th className="text-right">Salary</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="text-center">1</td>
                            <td>Andrew Mike</td>
                            <td>Develop</td>
                            <td className="text-right">€ 99,225</td>
                            <td className="td-actions text-right">
                                <a href="#" rel="tooltip" title="" className="btn btn-info btn-simple btn-xs" data-original-title="View Profile">
                                    <i className="ti-user"></i>
                                </a>
                                <a href="#" rel="tooltip" title="" className="btn btn-success btn-simple btn-xs" data-original-title="Edit Profile">
                                    <i className="ti-pencil-alt"></i>
                                </a>
                                <a href="#" rel="tooltip" title="" className="btn btn-danger btn-simple btn-xs" data-original-title="Remove">
                                    <i className="ti-close"></i>
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
  }
}

export default withRouter(PatientCases);