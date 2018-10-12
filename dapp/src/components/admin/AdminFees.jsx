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
} from 'saga-genesis'
import { displayWeiToUsd } from '~/utils/displayWeiToUsd'
import { etherToWei } from '~/utils/etherToWei'
import { toastr } from '~/toastr'
import { mixpanel } from '~/mixpanel'

function mapStateToProps(state) {
  const transactions = state.sagaGenesis.transactions
  const CasePaymentManager = contractByName(state, 'CasePaymentManager')
  const baseCaseFeeUsdWei = cacheCallValue(state, CasePaymentManager, 'baseCaseFeeUsdWei')
  return {
    baseCaseFeeUsdWei,
    CasePaymentManager,
    transactions
  }
}

function* adminFeeSaga({ CasePaymentManager }) {
  if (!CasePaymentManager) { return }
  yield cacheCall(CasePaymentManager, 'baseCaseFeeUsdWei')
}

export const AdminFees = connect(mapStateToProps)(
  withSaga(adminFeeSaga)(
    withSend(
      class _AdminFees extends Component {
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
            const setBaseCaseFeeId = this.props.send(this.props.CasePaymentManager, 'setBaseCaseFeeUsdWei', etherToWei(this.state.newCaseFeeUsd))()
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
              <PageTitle renderTitle={(t) => t('pageTitles.adminFees')} />
              <div className='container'>
                <div className='row'>
                  <div className='col-sm-6 col-sm-offset-3'>
                    <div className="card">
                      <div className="card-header">
                        <h3 className="title card-title">Fees</h3>
                      </div>

                      <form onSubmit={this.onSubmitBaseCaseFee}>
                        <div className="card-body">
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
                          </div>
                        </div>

                        <div className="card-footer text-right">
                          <input
                            disabled={!!this.state.setBaseCaseFeeId}
                            type='submit'
                            className='btn btn-lg btn-success'
                            value='Update Case Fee'
                           />
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
