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
  const CaseScheduleManager = contractByName(state, 'CaseScheduleManager')
  const secondsInADay = cacheCallValue(state, CaseScheduleManager, 'secondsInADay')

  return {
    transactions,
    CaseScheduleManager,
    secondsInADay
  }
}

function* adminCaseSaga({ CaseScheduleManager }) {
  if (!CaseScheduleManager) { return }
  yield cacheCall(CaseScheduleManager, 'secondsInADay')
}

export const AdminCases = connect(mapStateToProps)(
  withSaga(adminCaseSaga)(
    withSend(
      class _AdminCases extends Component {
        constructor (props) {
          super(props)
          this.state = {
            newSecondsInADay: ''
          }
        }

        isSecondsInADayValid () {
          return !!this.state.newSecondsInADay
        }

        componentWillReceiveProps (props) {
          if (this.state.setSecondsInADayId) {
            this.state.setSecondsInADayHandler.handle(props.transactions[this.state.setSecondsInADayId])
              .onError((error) => {
                toastr.transactionError(error)
                this.setState({ setSecondsInADayId: null, setSecondsInADayHandler: null })
              })
              .onTxHash(() => {
                toastr.success('The new case fee has been set')
                mixpanel.track('setBaseCaseFee')
                this.setState({ setSecondsInADayId: null, setSecondsInADayHandler: null, newSecondsInADay: '' })
              })
          }
        }

        onSubmit = (event) => {
          event.preventDefault()
          if (this.isSecondsInADayValid()) {
            const setSecondsInADayId = this.props.send(this.props.CaseScheduleManager, 'setSecondsInADay', this.state.newSecondsInADay)()
            this.setState({
              setSecondsInADayId,
              setSecondsInADayHandler: new TransactionStateHandler()
            })
          }
        }

        render() {
          return (
            <div>
              <PageTitle renderTitle={(t) => t('pageTitles.adminCases')} />
              <div className='container'>
                <div className='row'>
                  <div className='col-sm-6 col-sm-offset-3'>
                    <div className="card">
                      <div className="card-header">
                        <h3 className="title card-title">Seconds in a Day</h3>
                      </div>

                      <form onSubmit={this.onSubmit}>
                        <div className="card-body">
                          <div className="form-wrapper">
                            <div className='form-group'>

                              <label>New Seconds in a Day</label>
                              <p>
                                This value determines the duration of diagnosis or challenge.
                              </p>
                              <p>
                                <input
                                  type="number"
                                  className='form-control'
                                  placeholder={`${this.props.secondsInADay}`}
                                  value={this.state.newSecondsInADay}
                                  onChange={(e) => this.setState({ newSecondsInADay: e.target.value })}
                                  />
                              </p>
                              <p>
                                <small>A day is 86400 seconds long</small>
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="card-footer text-right">
                          <input
                            disabled={!!this.state.setSecondsInADayId}
                            type='submit'
                            className='btn btn-lg btn-success'
                            value='Update Seconds in a Day'
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
