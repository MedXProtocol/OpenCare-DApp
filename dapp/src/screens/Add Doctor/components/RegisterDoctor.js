import React, { Component } from 'react'
import Spinner from '../../../components/Spinner'
import { registerDoctor } from '../../../utils/web3-util'
import get from 'lodash.get'
import { connect } from 'react-redux'
import { withContractRegistry, withSend } from '@/saga-genesis'

function mapStateToProps(state, { contractRegistry }) {
  const account = get(state, 'sagaGenesis.accounts[0]')
  const DoctorManager = contractRegistry.requireAddressByName('DoctorManager')
  return {
    account,
    DoctorManager
  }
}

const RegisterDoctor = withContractRegistry(connect(mapStateToProps)(withSend(class _RegisterDoctor extends Component {
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
            <div className="card">
                <form
                    onSubmit={this.handleSubmit}
                    >
                    <div className="card-header">
                        <h4 className="card-title">Register Doctor</h4>
                        <p className="category">Register address as doctor</p>
                    </div>
                    <div className="card-content">
                        <div className="form-group">
                            <label htmlFor="hash">Account Address:</label>
                            <input
                                className="form-control"
                                id="hash"
                                value={this.state.address}
                                onChange={this.updateAddress}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-default" disabled={this.state.submitInProgress}>Register</button>
                    </div>
                </form>
                <Spinner loading={this.state.submitInProgress}/>
            </div>
        )
    }
})))

export default RegisterDoctor
