import React, { Component } from 'react'
import { EthAddress } from '~/components/EthAddress'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faEdit from '@fortawesome/fontawesome-free-solid/faEdit';
import sortBy from 'lodash.sortby'
import { isBlank } from '~/utils/isBlank'
import { withDoctors } from '~/components/withDoctors'
import { withSend } from '~/saga-genesis'

export const RegisterDoctorContainer =
  withDoctors(
    withSend(
      class _RegisterDoctor extends Component {

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
                              value={this.state.address}
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
