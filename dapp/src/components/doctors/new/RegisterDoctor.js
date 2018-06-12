import React, { Component } from 'react'
import Spinner from '~/components/Spinner'
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
            submitInProgress: false
        }
    }

    updateAddress = (event) => {
        this.setState({address: event.target.value})
    }

    handleSubmit = (event) => {
        event.preventDefault()
        this.registerDoctor()
    }

    registerDoctor = () => {
      const { DoctorManager, send } = this.props
      send(DoctorManager, 'addDoctor', this.state.address)()
    }

    componentWillReceiveProps (props) {
      if (!this.props.account && props.account) {
        this.setState({address: props.account})
      }
    }

    onSuccess = () => {
        this.setState({submitInProgress: false})
    }

    onError = (error) => {
        this.setState({error: error})
        this.setState({submitInProgress: false})
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
                          <label htmlFor="hash">Account Address</label>
                          <input
                            className="form-control"
                            id="hash"
                            value={this.state.address}
                            onChange={this.updateAddress}
                            required
                          />
                        </div>
                        <div className="text-right">
                          <button type="submit" className="btn btn-success btn-default" disabled={this.state.submitInProgress}>Register</button>
                        </div>
                      </form>
                    </div>
                    <Spinner loading={this.state.submitInProgress}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
    }
})))
