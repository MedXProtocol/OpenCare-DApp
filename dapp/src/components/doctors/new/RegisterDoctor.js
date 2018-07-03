import React, { Component } from 'react'
import get from 'lodash.get'
import { connect } from 'react-redux'
import { withContractRegistry, withSend } from '~/saga-genesis'
import { contractByName } from '~/saga-genesis/state-finders'

function mapStateToProps(state) {
  const account = get(state, 'sagaGenesis.accounts[0]')
  const DoctorManager = contractByName(state, 'DoctorManager')
  return {
    account,
    DoctorManager
  }
}

export const RegisterDoctorContainer = withContractRegistry(connect(mapStateToProps)(withSend(class _RegisterDoctor extends Component {
    constructor(props){
      super(props)
      this.state = {
        address: this.props.account || '',
        name: '',
        submitInProgress: false
      }
    }

    handleSubmit = (event) => {
      event.preventDefault()
      this.registerDoctor()
    }

    registerDoctor = () => {
      const { DoctorManager, send } = this.props
      send(DoctorManager, 'addDoctor', this.state.address, this.state.name)()
    }

    componentWillReceiveProps (props) {
      if (!this.props.account && props.account) {
        this.setState({address: props.account})
      }
    }

    render() {
        return (
          <div className="container">
            <div className="row">
              <div className="col-sm-6 col-sm-offset-3">
                <div className="card">
                  <div className="card-header">
                    <h4 className="title card-title">
                      Register a new Doctor
                    </h4>
                  </div>
                  <div className="card-body">
                    <div className="form-wrapper">
                      <form onSubmit={this.handleSubmit}>
                        <div className="form-group">
                          <label htmlFor="hash">Address</label>
                          <input
                            className="form-control"
                            value={this.state.address}
                            onChange={(e) => this.setState({address: e.target.value})}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="hash">Name</label>
                          <input
                            className="form-control"
                            value={this.state.name}
                            placeholder='Dr. Wexler'
                            onChange={(e) => this.setState({name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="text-right">
                          <button type="submit" className="btn btn-success btn-default">Register</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
    }
})))
