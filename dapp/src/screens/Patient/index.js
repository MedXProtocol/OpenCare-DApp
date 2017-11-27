import React, { Component } from 'react';
import {getAllCasesForCurrentAccount} from '../../utils/web3-util';
import { withRouter } from 'react-router-dom';


class Patient extends Component {
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
  
  navigateToNewCaseScree = () => {
    this.props.history.push('/new-case');
  }
  
  render() {
    return (
      <div>
        <h1>Patient view</h1>
        <div>
          <button 
              type="button" 
              className="btn btn-default"
              onClick={() => this.navigateToNewCaseScree()}>
            New Case
            </button>
        </div>
        <div className="list-group">
          {this.renderCases(this.state.cases)}
        </div>
      </div>
    );
  }

  renderCases (cases) {
    return cases.map(c => 
      <div key={c.address} className="list-group-item">
        <span>{c.caseDetailLocationHash}</span>,
        <span>{c.text}</span>,
        <span>{c.status.toNumber()}</span>
      </div>
    );
  }
}

export default withRouter(Patient);
