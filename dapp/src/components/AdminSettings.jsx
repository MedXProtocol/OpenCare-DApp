import React, { Component } from 'react'
import { PageTitle } from '~/components/PageTitle'
import { connect } from 'react-redux'
import {
  withSaga,
  cacheCall,
  cacheCallValue,
  withSend,
  contractByName,
  TransactionStateHandler
} from '~/saga-genesis'
import { toastr } from '~/toastr'
import { mixpanel } from '~/mixpanel'

function mapStateToProps(state) {
  const transactions = state.sagaGenesis.transactions
  const AdminSettings = contractByName(state, 'AdminSettings')
  const baseCaseFeeUsdWei = cacheCallValue(state, AdminSettings, 'baseCaseFeeUsdWei')
  return {
    baseCaseFeeUsdWei,
    AdminSettings,
    transactions
  }
}

function* adminFeeSaga({ AdminSettings }) {
  if (!AdminSettings) { return }
  yield cacheCall(AdminSettings, 'baseCaseFeeUsdWei')
}

export const AdminDappSettings = connect(mapStateToProps)(
  withSaga(adminFeeSaga)(
    withSend(
      class _AdminDappSettings extends Component {
        constructor (props) {
          super(props)
          this.state = {
            newCaseFeeUsd: ''
          }
        }

        isBaseCaseFeeValid () {
          if (!this.state.newCaseFeeUsd) { return false }
          try {
            etherToWei(this.state.newCaseFeeUsd)
            return true
          } catch (error) {
            return false
          }
        }

        componentWillReceiveProps (props) {
          if (this.state.setBaseCaseFeeId) {
            this.state.setBaseCaseFeeHandler.handle(props.transactions[this.state.setBaseCaseFeeId])
              .onError((error) => {
                toastr.transactionError(error)
                this.setState({ setBaseCaseFeeId: null, setBaseCaseFeeHandler: null })
              })
              .onTxHash(() => {
                toastr.success('The new case fee has been set')
                mixpanel.track('setBaseCaseFee')
                this.setState({ setBaseCaseFeeId: null, setBaseCaseFeeHandler: null, newCaseFeeUsd: '' })
              })
          }
        }

        onSubmitBaseCaseFee = (event) => {
          event.preventDefault()
          if (this.isBaseCaseFeeValid()) {
            const setBaseCaseFeeId = this.props.send(this.props.AdminSettings, 'setBaseCaseFeeUsdWei', etherToWei(this.state.newCaseFeeUsd))()
            this.setState({
              setBaseCaseFeeId,
              setBaseCaseFeeHandler: new TransactionStateHandler()
            })
          }
        }

        render() {
          const caseFeeUsd = displayWeiToUsd(this.props.baseCaseFeeUsdWei)

          return (
            <div>
              <PageTitle renderTitle={(t) => t('pageTitles.adminDappSettings')} />
              <div className='container'>
                <div className='row'>
                  <div className='col-sm-6 col-sm-offset-3'>
                    <div className="card">
                      <div className="card-header">
                        <h3 className="title card-title">DappSettings</h3>
                      </div>
                      <div className="card-body">
                        <form onSubmit={this.onSubmitBaseCaseFee}>
                          <div className="form-wrapper">
                            <div className='form-group'>
                              <label>New Case Fee (USD)</label>
                              <input
                                type="number"
                                className='form-control'
                                placeholder={`Currently: $${caseFeeUsd} USD`}
                                value={this.state.newCaseFeeUsd}
                                onChange={(e) => this.setState({ newCaseFeeUsd: e.target.value })}
                                />
                            </div>
                            <div className='form-group'>
                              <input
                                disabled={!!this.state.setBaseCaseFeeId}
                                type='submit'
                                className='btn btn-sm btn-success'
                                value='Update' />
                            </div>
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
      }
    )
  )
)
