import React, { Component } from 'react'
import { PageTitle } from '~/components/PageTitle'
import { connect } from 'react-redux'
import {
  withSaga,
  cacheCall,
  cacheCallValueInt,
  withSend,
  contractByName,
  TransactionStateHandler
} from '~/saga-genesis'
import { HippoToggleButtonGroup } from '~/components/forms/HippoToggleButtonGroup'
import {
  usageRestrictionsMapInverted,
  usageRestrictionsToInt,
  usageRestrictionsToString
} from '~/utils/usageRestrictions'
import { toastr } from '~/toastr'
import { mixpanel } from '~/mixpanel'

function mapStateToProps(state) {
  const transactions = state.sagaGenesis.transactions
  const AdminSettings = contractByName(state, 'AdminSettings')
  const usageRestrictions = cacheCallValueInt(state, AdminSettings, 'usageRestrictions')
  const usageRestrictionsString = usageRestrictionsToString(usageRestrictions)

  return {
    AdminSettings,
    transactions,
    usageRestrictions,
    usageRestrictionsString
  }
}

function* adminSettingsSaga({ AdminSettings }) {
  if (!AdminSettings) { return }

  yield cacheCall(AdminSettings, 'usageRestrictions')
}

export const AdminSettings = connect(mapStateToProps)(
  withSaga(adminSettingsSaga)(
    withSend(
      class _AdminSettings extends Component {

        constructor(props) {
          super(props)

          this.state = {
            setUsageRestrictionsTxId: null
          }
        }

        componentWillReceiveProps (nextProps) {
          const { usageRestrictionsString } = nextProps
          if (!this.state.usageRestrictionsString && usageRestrictionsString) {
            this.setState({ usageRestrictionsString })
          }

          if (this.state.setUsageRestrictionsTxId) {
            this.state.setUsageRestrictionsHandler.handle(nextProps.transactions[this.state.setUsageRestrictionsTxId])
              .onError((error) => {
                toastr.transactionError(error)
                this.setState({ setUsageRestrictionsTxId: null, setUsageRestrictionsHandler: null })
              })
              .onConfirmed(() => {
                toastr.success('Updated Usage Restrictions confirmed!')
                this.setState({ setUsageRestrictionsTxId: null, setUsageRestrictionsHandler: null })
              })
              .onTxHash(() => {
                toastr.success('Usage Restrictions transaction sent. Will take a few moments to confirm.')
                mixpanel.track('AdminSetUsageRestrictions')
                this.setState({ setUsageRestrictionsTxId: null, setUsageRestrictionsHandler: null })
              })
          }
        }

        handleSubmitUsageRestrictions = (event) => {
          event.preventDefault()

          const setUsageRestrictionsTxId = this.props.send(
            this.props.AdminSettings,
            'setUsageRestrictions',
            usageRestrictionsToInt(this.state.usageRestrictionsString)
          )()

          this.setState({
            setUsageRestrictionsTxId,
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

                      <form onSubmit={this.handleSubmitUsageRestrictions}>
                        <div className="card-body">
                          {
                            usageRestrictionsString
                              ? <HippoToggleButtonGroup
                                  id='usageRestrictionsString'
                                  name='usageRestrictionsString'
                                  colClasses='col-xs-12'
                                  label='Contract Usage Restrictions'
                                  buttonGroupOnChange={this.handleButtonGroupOnChange}
                                  defaultValue={usageRestrictionsString}
                                  values={Object.keys(usageRestrictionsMapInverted).map(value => value)}
                                />
                              : null
                          }
                          <p>
                            <strong>Currently:</strong> {usageRestrictionsString}
                          </p>
                        </div>

                        <div className="card-footer text-right">
                          <button
                            disabled={!!this.state.setUsageRestrictionsTxId}
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
