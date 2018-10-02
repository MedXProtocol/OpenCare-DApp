import React, { Component } from 'react'
import { PageTitle } from '~/components/PageTitle'
import { Checkbox } from 'react-bootstrap'
import { connect } from 'react-redux'
import {
  withSaga,
  cacheCall,
  cacheCallValue,
  cacheCallValueInt,
  withSend,
  contractByName,
  TransactionStateHandler
} from '~/saga-genesis'
import {
  all
} from 'redux-saga/effects'
import { HippoToggleButtonGroup } from '~/components/forms/HippoToggleButtonGroup'
import {
  usageRestrictionsMapInverted,
  usageRestrictionsToInt,
  usageRestrictionsToString
} from '~/utils/usageRestrictions'
import { defined } from '~/utils/defined'
import { toastr } from '~/toastr'
import { mixpanel } from '~/mixpanel'

function mapStateToProps(state) {
  const AdminSettings = contractByName(state, 'AdminSettings')
  const betaFaucetRegisterDoctor = cacheCallValue(state, AdminSettings, 'betaFaucetRegisterDoctor')
  const transactions = state.sagaGenesis.transactions
  const usageRestrictions = cacheCallValueInt(state, AdminSettings, 'usageRestrictions')
  const usageRestrictionsString = usageRestrictionsToString(usageRestrictions)

  return {
    AdminSettings,
    betaFaucetRegisterDoctor,
    transactions,
    usageRestrictions,
    usageRestrictionsString
  }
}

function* adminSettingsSaga({ AdminSettings, CaseScheduleManager }) {
  if (!AdminSettings) { return }

  yield all([
    cacheCall(AdminSettings, 'betaFaucetRegisterDoctor'),
    cacheCall(AdminSettings, 'usageRestrictions')
  ])
}

export const AdminSettings = connect(mapStateToProps)(
  withSaga(adminSettingsSaga)(
    withSend(
      class _AdminSettings extends Component {

        constructor(props) {
          super(props)

          this.state = {
            betaFaucetRegisterDoctor: 0,
            updateAdminSettingsTxId: null
          }
        }

        componentWillReceiveProps (nextProps) {
          if (!this.state.usageRestrictionsString && nextProps.usageRestrictionsString) {
            this.setState({ usageRestrictionsString: nextProps.usageRestrictionsString })
          }

          // only do this once, soon after page load when we receive the current
          // value from the contract
          if (
               !defined(this.props.betaFaucetRegisterDoctor)
            && defined(nextProps.betaFaucetRegisterDoctor)
          ) {
            this.setState({ betaFaucetRegisterDoctor: nextProps.betaFaucetRegisterDoctor })
          }

          if (this.state.updateAdminSettingsTxId) {
            this.state.setUsageRestrictionsHandler.handle(nextProps.transactions[this.state.updateAdminSettingsTxId])
              .onError((error) => {
                toastr.transactionError(error)
                this.setState({ updateAdminSettingsTxId: null, setUsageRestrictionsHandler: null })
              })
              .onConfirmed(() => {
                toastr.success('Admin Settings updated!')
                this.setState({ updateAdminSettingsTxId: null, setUsageRestrictionsHandler: null })
              })
              .onTxHash(() => {
                toastr.success('Admin Settings transaction sent. Will take a few moments to confirm.')
                mixpanel.track('Admin Updated Settings')
                this.setState({ updateAdminSettingsTxId: null, setUsageRestrictionsHandler: null })
              })
          }
        }

        handleBetaFaucetRegisterDoctor = (event) => {
          this.setState({
            betaFaucetRegisterDoctor: !this.state.betaFaucetRegisterDoctor
          })
        }

        handleSubmit = (event) => {
          event.preventDefault()

          const updateAdminSettingsTxId = this.props.send(
            this.props.AdminSettings,
            'updateAdminSettings',
            usageRestrictionsToInt(this.state.usageRestrictionsString),
            this.state.betaFaucetRegisterDoctor ? 1 : 0
          )()

          this.setState({
            updateAdminSettingsTxId,
            setUsageRestrictionsHandler: new TransactionStateHandler()
          })
        }

        handleButtonGroupOnChange = (event) => {
          this.setState({ [event.target.name]: event.target.value })
        }

        render() {
          const { usageRestrictionsString } = this.props

          return (
            <div>
              <PageTitle renderTitle={(t) => t('pageTitles.adminSettings')} />
              <div className='container'>
                <div className='row'>
                  <div className='col-sm-8 col-sm-offset-2'>
                    <div className="card">
                      <div className="card-header">
                        <h3 className="title card-title">Admin Settings</h3>
                      </div>

                      <form onSubmit={this.handleSubmit}>
                        <div className="card-body">
                          {
                            usageRestrictionsString
                              ? <HippoToggleButtonGroup
                                  id='usageRestrictionsString'
                                  name='usageRestrictionsString'
                                  colClasses='col-xs-12'
                                  label='Usage Restrictions:'
                                  buttonGroupOnChange={this.handleButtonGroupOnChange}
                                  defaultValue={usageRestrictionsString}
                                  values={Object.keys(usageRestrictionsMapInverted).map(value => value)}
                                />
                              : null
                          }
                          <p>
                            <strong>Currently:</strong> {usageRestrictionsString}
                          </p>

                          <hr />

                          <h4>
                            Beta Faucet
                          </h4>
                          <Checkbox
                            inline
                            onChange={this.handleBetaFaucetRegisterDoctor}
                            checked={this.state.betaFaucetRegisterDoctor}
                          >
                            Patients can upgrade to Doctors &amp; Dermatologists
                          </Checkbox>
                          <p>
                            <strong>Currently:</strong>
                            &nbsp;{this.props.betaFaucetRegisterDoctor ? 'Allowed' : 'Disallowed'}
                          </p>
                        </div>

                        <div className="card-footer text-right">
                          <button
                            disabled={!!this.state.updateAdminSettingsTxId}
                            type="submit"
                            className="btn btn-lg btn-success"
                          >
                            Update Settings
                          </button>
                        </div>
                      </form>
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
