import React, { Component } from 'react'
import { connect } from 'react-redux'
import { EthAddress } from '~/components/EthAddress'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faEdit from '@fortawesome/fontawesome-free-solid/faEdit';
import get from 'lodash.get'
import sortBy from 'lodash.sortby'
import { isBlank } from '~/utils/isBlank'
import { withSend, withSaga, cacheCallValue, cacheCall } from '~/saga-genesis'
import { contractByName } from '~/saga-genesis/state-finders'

function mapStateToProps(state) {
  const account = get(state, 'sagaGenesis.accounts[0]')
  const AccountManager = contractByName(state, 'AccountManager')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const doctorCount = cacheCallValue(state, DoctorManager, 'doctorCount')
  const doctors = []
  for (var i = 0; i < doctorCount; i++) {
    const address = cacheCallValue(state, DoctorManager, 'doctorAddresses', i)
    doctors.push({
      doctorIndex: i,
      name: cacheCallValue(state, DoctorManager, 'doctorNames', i),
      isActive: cacheCallValue(state, DoctorManager, 'isActive', address),
      publicKey: cacheCallValue(state, AccountManager, 'publicKeys', address),
      address
    })
  }

  return {
    AccountManager,
    account,
    DoctorManager,
    doctorCount,
    doctors
  }
}

function* saga({ DoctorManager, AccountManager }) {
  if (!DoctorManager || !AccountManager) { return }
  const doctorCount = yield cacheCall(DoctorManager, 'doctorCount')
  for (var i = 0; i < doctorCount; i++) {
    const address = yield cacheCall(DoctorManager, 'doctorAddresses', i)
    yield cacheCall(DoctorManager, 'doctorNames', i)
    yield cacheCall(DoctorManager, 'isActive', address)
    yield cacheCall(AccountManager, 'publicKeys', address)
  }
}

export const RegisterDoctorContainer =
  withSend(
    connect(mapStateToProps)(
      withSaga(saga, { propTriggers: ['doctorCount', 'DoctorManager', 'AccountManager', 'isActive']})(
        class _DoctorSelect extends Component {

          constructor(props){
            super(props)
            this.state = {
              address: '',
              name: '',
              submitInProgress: false
            }
          }

          handleAdd = (event) => {
            event.preventDefault()
            this.registerDoctor()
          }

          handleActivate = (name, address) => {
            this.setState({
              name: name,
              address: address
            }, this.registerDoctor)
          }

          handleDeactivate = (name, address) => {
            this.setState({
              name: name,
              address: address
            }, this.deactivateDoctor)
          }

          registerDoctor = () => {
            const { DoctorManager, send } = this.props
            send(DoctorManager, 'addOrReactivateDoctor', this.state.address, this.state.name)()
          }

          deactivateDoctor = () => {
            const { DoctorManager, send } = this.props
            send(DoctorManager, 'deactivateDoctor', this.state.address)()
          }

          render() {
            const doctors = sortBy(this.props.doctors, ['isActive']).reverse()
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
                          <form onSubmit={this.handleAdd}>
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
                  <div className="col-xs-12">
                    <div className="card">
                      <div className="card-body table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Doctor Address</th>
                              <th>Doctor Name</th>
                              <th>Public Key Set?</th>
                              <th className="text-right">
                                <FontAwesomeIcon icon={faEdit} />
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <TransitionGroup component={null}>
                              {doctors.map(({publicKey, isActive, address, name, doctorIndex}) => {
                                return (
                                  <CSSTransition
                                    key={`doctor-row-transition-${doctorIndex}`}
                                    timeout={100}
                                    appear={true}
                                    classNames="fade">
                                      <tr key={`doctor-row-${doctorIndex}`} className={!isActive ? 'deactivated' : ''}>
                                        <td width="50%" className="eth-address text">
                                          <span>
                                            <EthAddress address={address} showFull={true} />
                                          </span>
                                        </td>
                                        <td width="30%" className="td--status">
                                          {name}
                                        </td>
                                        <td>
                                          {isBlank(publicKey) ? 'No' : 'Yes'}
                                        </td>
                                        <td width="20%" className="td-actions text-right">
                                          { isActive ? (
                                              <a
                                                onClick={() => { this.handleDeactivate(name, address) }}
                                                className="btn btn-xs btn-info"
                                              >
                                                Deactivate
                                              </a>
                                            ) : (
                                              <a
                                                onClick={() => { this.handleActivate(name, address) }}
                                                className="btn btn-xs btn-default"
                                              >
                                                Reactivate
                                              </a>
                                            )
                                          }
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
  )
