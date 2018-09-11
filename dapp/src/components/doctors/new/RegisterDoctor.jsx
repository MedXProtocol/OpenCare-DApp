import React, { Component } from 'react'
import { EthAddress } from '~/components/EthAddress'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faEdit from '@fortawesome/fontawesome-free-solid/faEdit';
import faCheck from '@fortawesome/fontawesome-free-solid/faCheck';
import sortBy from 'lodash.sortby'
import { isBlank } from '~/utils/isBlank'
import { withDoctors } from '~/components/withDoctors'
import { withSend } from '~/saga-genesis'
import classnames from 'classnames'
import Select from 'react-select'
import * as Animated from 'react-select/lib/animated';
import { customStyles } from '~/config/react-select-custom-styles'
import { isNotEmptyString } from '~/utils/isNotEmptyString'
import { countries } from '~/lib/countries'
import { regions } from '~/lib/regions'
import { toastr } from '~/toastr'
import pull from 'lodash.pull'

require('./RegisterDoctor.css')

const requiredFields = [
  'address',
  'name',
  'country'
]
// These fields are dynamically added as required depending on choices the user makes:
// 'region' => USA / Canada only

export const RegisterDoctorContainer =
  withDoctors(
    withSend(
      class _RegisterDoctor extends Component {

        constructor(props){
          super(props)
          this.state = {
            address: '',
            name: '',
            country: '',
            region: '',
            errors: [],
            regionOptions: [],
            submitInProgress: false
          }

          this.setRegionRef = element => { this.regionInput = element }

          this.priorityDoctors = []
          if (process.env.REACT_APP_COMMA_SEPARATED_PRIORITY_DOCTOR_ADDRESSES) {
            this.priorityDoctors = process.env.REACT_APP_COMMA_SEPARATED_PRIORITY_DOCTOR_ADDRESSES
              .split(',')
              .filter((val) => val)
          }
        }

        handleSubmit = async (event) => {
          event.preventDefault()

          await this.runValidation()

          if (this.state.errors.length === 0) {
            this.addOrReactivateDoctor()
          }
        }

        handleActivate = (address, name, country, region) => {
          this.setState({
            address: address,
            name: name,
            country: country,
            region: region
          }, this.addOrReactivateDoctor)
        }

        handleDeactivate = (address, name, country, region) => {
          this.setState({
            address: address,
            name: name,
            country: country,
            region: region
          }, this.deactivateDoctor)
        }

        addOrReactivateDoctor = () => {
          const { DoctorManager, send } = this.props
          send(
            DoctorManager,
            'addOrReactivateDoctor',
            this.state.address,
            this.state.name,
            this.state.country,
            this.state.region
          )()
        }

        deactivateDoctor = () => {
          const { DoctorManager, send } = this.props
          send(DoctorManager, 'deactivateDoctor', this.state.address)()
        }

        validateField = (fieldName) => {
          if (!requiredFields.includes(fieldName)) {
            return
          }

          const errors = this.state.errors

          if (!isNotEmptyString(this.state[fieldName])) {
            errors.push(fieldName)
          } else {
            pull(errors, fieldName)
          }

          this.setState({ errors: errors })
        }

        runValidation = async () => {
          // reset error states
          await this.setState({ errors: [] })

          let errors = []
          let length = requiredFields.length

          for (var fieldIndex = 0; fieldIndex < length; fieldIndex++) {
            let fieldName = requiredFields[fieldIndex]
            if (!isNotEmptyString(this.state[fieldName])) {
              errors.push(fieldName)
            }
          }

          const existingDoc = this.props.doctors.find((doctor) => {
            return (
              doctor.isActive
              && doctor.address.toLowerCase() === this.state.address.toLowerCase()
            )
          })

          if (existingDoc) {
            errors.push('address')
            toastr.error('This address is already registered to another doctor.')
          }

          await this.setState({ errors: errors })

          if (errors.length > 0) {
            // First reset it so it will still take the user to the anchor even if
            // we already took them there before (still error on same field)
            window.location.hash = `#`;

            // Go to first error field
            window.location.hash = `#${errors[0]}`;
          }
        }

        handleCountryChange = (newValue) => {
          this.setState({ country: newValue.value }, this.checkCountry)
        }

        checkCountry = () => {
          this.validateField('country')

          if (this.isCanadaOrUSA()) {
            requiredFields.push('region')
          } else {
            pull(requiredFields, 'region')

            this.setState({ region: '' })
            this.regionInput.select.clearValue()
          }

          this.setState({ regionOptions: this.isCanadaOrUSA() ? regions[this.state.country] : [] })
        }

        handleRegionChange = (newValue) => {
          this.setState({ region: newValue ? newValue.value : '' }, () => {
            if (this.isCanadaOrUSA()) {
              this.validateField('region')
            }
          })
        }

        errorMessage = (fieldName) => {
          let msg
          if (fieldName === 'country' || fieldName === 'region') {
            msg = 'must be chosen'
          } else {
            msg = 'must be filled out'
          }
          return msg
        }

        isCanadaOrUSA = () => {
          return this.state.country === 'US' || this.state.country === 'CA'
        }

        render() {
          const doctors = sortBy(this.props.doctors, ['isActive']).reverse()

          let errors = {}
          for (var i = 0; i < this.state.errors.length; i++) {
            let fieldName = this.state.errors[i]

            errors[fieldName] =
              <p key={`errors-${i}`} className='has-error help-block small'>
                {this.errorMessage(fieldName)}
              </p>
          }

          return (
            <div className='container'>
              <div className="row">
                <div className="col-xs-12 col-sm-8 col-sm-offset-2">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="title">
                        Register a new Doctor
                      </h3>
                    </div>
                    <div className="card-body">
                      <div className="form-wrapper">
                        <form onSubmit={this.handleSubmit}>
                          <div className={classnames('form-group', { 'has-error': errors['address'] })}>
                            <label htmlFor="address">Address</label>
                            <input
                              id="address"
                              className="form-control"
                              value={this.state.address}
                              placeholder="0x000000000000000000000000000"
                              onChange={(e) => this.setState({address: e.target.value})}
                            />
                            {errors['address']}
                          </div>

                          <div className={classnames('form-group', { 'has-error': errors['name'] })}>
                            <label htmlFor="name">Name</label>
                            <input
                              className="form-control"
                              value={this.state.name}
                              placeholder='Dr. Hibbert'
                              onChange={(e) => this.setState({name: e.target.value})}
                              id="name"
                            />
                            {errors['name']}
                          </div>

                          <div className={classnames('form-group', { 'has-error': errors['country'] })}>
                            <label htmlFor="name">Country</label>
                            <Select
                              placeholder="Please select the Doctor's Country"
                              styles={customStyles}
                              components={Animated}
                              closeMenuOnSelect={true}
                              options={countries}
                              onChange={this.handleCountryChange}
                              selected={this.state.country}
                              required
                            />
                            {errors['country']}
                          </div>

                          <div className={classnames('form-group', { 'has-error': errors['region'] })}>
                            <label htmlFor="name">Region</label>
                            <Select
                              isDisabled={!this.isCanadaOrUSA()}
                              placeholder="Please select the Doctor's Region"
                              styles={customStyles}
                              components={Animated}
                              closeMenuOnSelect={true}
                              ref={this.setRegionRef}
                              options={this.state.regionOptions}
                              onChange={this.handleRegionChange}
                              selected={this.state.region}
                            />
                            {errors['region']}
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
                            <th>Priority?</th>
                            <th>Online</th>
                            <th>Doctor Address &amp; Specialities</th>
                            <th>Doctor Details</th>
                            <th>Public Key Set?</th>
                            <th className="text-right">
                              <FontAwesomeIcon icon={faEdit} />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <TransitionGroup component={null}>
                            {doctors.map(({
                              publicKey,
                              isActive,
                              isDermatologist,
                              address,
                              name,
                              country,
                              region,
                              doctorIndex,
                              online
                            }) => {
                              const countryAndRegion = <React.Fragment>
                                <br />
                                {region ? `${region}, ` : ''}{country}
                              </React.Fragment>

                              return (
                                <CSSTransition
                                  key={`doctor-row-transition-${doctorIndex}`}
                                  timeout={100}
                                  appear={true}
                                  classNames="fade">
                                    <tr key={`doctor-row-${doctorIndex}`} className={!isActive ? 'deactivated' : ''}>
                                      <td width="5%" className='text-center text-green'>
                                        {
                                          this.priorityDoctors.includes(address.toLowerCase())
                                            ? <FontAwesomeIcon icon={faCheck} />
                                            : null
                                        }
                                      </td>
                                      <td width="5%" className='text-center'>
                                        {
                                          online
                                            ?
                                            <div className='register-doctor__online-circle' />
                                            :
                                            <div className='register-doctor__offline-circle' />
                                         }
                                      </td>
                                      <td width="46%" className="eth-address text">
                                        <span>
                                          <EthAddress address={address} showFull={true} />
                                        </span>
                                        <br />
                                        <strong>{isDermatologist}</strong>
                                      </td>
                                      <td width="20%" className="td--status">
                                        {name}
                                        {countryAndRegion}
                                      </td>
                                      <td width="14%">
                                        {isBlank(publicKey) ? 'No' : 'Yes'}
                                      </td>
                                      <td width="15%" className="td-actions text-right">
                                        { isActive ? (
                                            <a
                                              onClick={() => { this.handleDeactivate(address, name, country, region) }}
                                              className="btn btn-xs btn-info"
                                            >
                                              Deactivate
                                            </a>
                                          ) : (
                                            <a
                                              onClick={() => { this.handleActivate(address, name, country, region) }}
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
