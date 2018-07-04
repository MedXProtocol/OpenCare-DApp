import React, { Component } from 'react'
import get from 'lodash.get'
import { connect } from 'react-redux'
import { EthAddress } from '~/components/EthAddress'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faEdit from '@fortawesome/fontawesome-free-solid/faEdit';
import { withSaga, cacheCallValue, cacheCall } from '~/saga-genesis'
import { contractByName } from '~/saga-genesis/state-finders'

function mapStateToProps(state) {
  const account = get(state, 'sagaGenesis.accounts[0]')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const doctorCount = cacheCallValue(state, DoctorManager, 'doctorCount')
  const doctors = []
  for (var i = 0; i < doctorCount; i++) {
    const address = cacheCallValue(state, DoctorManager, 'doctorAddresses', i)
    doctors.push({
      name: cacheCallValue(state, DoctorManager, 'doctorNames', i),
      address
    })
  }

  return {
    account,
    DoctorManager,
    doctorCount,
    doctors
  }
}

function* saga({ DoctorManager }) {
  if (!DoctorManager) { return }
  const doctorCount = yield cacheCall(DoctorManager, 'doctorCount')
  for (var i = 0; i < doctorCount; i++) {
    yield cacheCall(DoctorManager, 'doctorAddresses', i)
    yield cacheCall(DoctorManager, 'doctorNames', i)
  }
}

export const RegisterDoctorContainer =
  connect(mapStateToProps)(
    withSaga(saga, { propTriggers: ['doctorCount', 'DoctorManager']})(
      class _DoctorSelect extends Component {

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

        handleRemove = (event) => {
          event.preventDefault()
          this.deactivateDoctor()
        }

        registerDoctor = () => {
          const { DoctorManager, send } = this.props
          send(DoctorManager, 'addOrReactivateDoctor', this.state.address, this.state.name)()
        }

        deactivateDoctor = () => {
          const { DoctorManager, send } = this.props
          send(DoctorManager, 'deactivateDoctor', this.state.address)()
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
                <div className="col-xs-12 col-sm-6 col-sm-offset-3">
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
                            <label htmlFor="address">Address</label>
                            <input
                              id="address"
                              className="form-control"
                              placeholder="0x000000000000000000000000000"
                              onChange={(e) => this.setState({address: e.target.value})}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                              className="form-control"
                              value={this.state.name}
                              placeholder='Dr. Wexler'
                              onChange={(e) => this.setState({name: e.target.value})}
                              id="name"
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

              <div className="row">
                <div className="col-xs-12 col-sm-10 col-sm-offset-1">
                  <div className="card">
                    <div className="card-body table-responsive">

                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Doctor Address</th>
                            <th>Doctor Name</th>
                            <th className="text-right">
                              <FontAwesomeIcon icon={faEdit} />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <TransitionGroup component={null}>
                            {this.props.doctors.map(({address, name, doctorIndex}) => {
                              return (
                                <CSSTransition
                                  key={doctorIndex}
                                  timeout={100}
                                  appear={true}
                                  classNames="fade">
                                    <tr key={doctorIndex}>
                                      <td className="eth-address text">
                                        <span>
                                          <EthAddress address={address}  />
                                        </span>
                                      </td>
                                      <td width="15%" className="td--status">
                                        {name}
                                      </td>
                                      <td width="15%" className="td-actions text-right">
                                        <a
                                          onClick={this.handleRemove}
                                          className="btn btn-sm btn-info"
                                        >
                                          Remove
                                        </a>
                                      </td>
                                    </tr>
                                </CSSTransition>
                              )
                            })}
                          </TransitionGroup>
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            </div>
        )
      }
    }
  )
)
