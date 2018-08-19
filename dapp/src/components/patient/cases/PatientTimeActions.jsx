import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { all } from 'redux-saga/effects'
import {
  contractByName,
  cacheCall,
  cacheCallValueInt,
  withSaga,
  withSend,
  TransactionStateHandler
} from '~/saga-genesis'
import { caseStale } from '~/services/caseStale'
import { toastr } from '~/toastr'
import { mixpanel } from '~/mixpanel'
import { secondsInADay } from '~/config/constants'
import * as routes from '~/config/routes'

function mapStateToProps(state, { caseAddress, caseKey }) {
  const CaseScheduleManager = contractByName(state, 'CaseScheduleManager')

  const transactions = state.sagaGenesis.transactions
  const status = cacheCallValueInt(state, caseAddress, 'status')
  const updatedAt = cacheCallValueInt(state, CaseScheduleManager, 'updatedAt', caseAddress)

  return {
    transactions,
    status,
    updatedAt
  }
}

function* saga({ CaseScheduleManager, caseAddress }) {
  yield all([
    cacheCall(caseAddress, 'status'),
    cacheCall(CaseScheduleManager, 'updatedAt', caseAddress)
  ])
}

const PatientTimeActions = connect(mapStateToProps)(withSend(withSaga(saga)(
  class _PatientTimeActions extends Component {

    static propTypes = {
      caseAddress: PropTypes.string.isRequired,
      status: PropTypes.number,
      updatedAt: PropTypes.number
    }

    constructor(props) {
      super(props)

      this.state = {
        loading: false
      }
    }

    componentWillReceiveProps (nextProps) {
      this.requestNewDocTransactionStateHandler(nextProps)
      this.withdrawTransactionStateHandler(nextProps)
    }

    handlePatientWithdraw = () => {
      const withdrawTransactionId = this.props.send(this.props.caseAddress, 'patientWithdrawFunds')()
      this.setState({
        withdrawTransactionId,
        withdrawTransactionStateHandler: new TransactionStateHandler(),
        loading: true
      })
    }

    handlePatientRequestNewDoctor = () => {
      const requestNewDocTransactionId = this.props.send(this.props.caseAddress, 'patientRequestNewDoctor')()
      this.setState({
        requestNewDocTransactionId,
        requestNewDocTransactionStateHandler: new TransactionStateHandler(),
        loading: true
      })
    }

    withdrawTransactionStateHandler = (props) => {
      if (this.state.withdrawTransactionStateHandler) {
        this.state.withdrawTransactionStateHandler.handle(props.transactions[this.state.withdrawTransactionId])
          .onError((error) => {
            toastr.transactionError(error)
            this.setState({ withdrawTransactionStateHandler: null, loading: false })
          })
          .onConfirmed(() => {
            this.setState({ withdrawTransactionStateHandler: null, loading: false })
          })
          .onTxHash(() => {
            toastr.success('Your patient withdraw funds transaction has been broadcast to the network. It will take a moment to be confirmed and then you will receive your deposit back.')
            mixpanel.track('Patient Withdrew Funds After 24+ Hours')
            this.props.history.push(routes.PATIENTS_CASES)
          })
      }
    }

    requestNewDocTransactionStateHandler = (props) => {
      if (this.state.requestNewDocTransactionStateHandler) {
        this.state.requestNewDocTransactionStateHandler.handle(props.transactions[this.state.requestNewDocTransactionId])
          .onError((error) => {
            toastr.transactionError(error)
            this.setState({ requestNewDocTransactionStateHandler: null, loading: false })
          })
          .onConfirmed(() => {
            this.setState({ requestNewDocTransactionStateHandler: null, loading: false })
          })
          .onTxHash(() => {
            toastr.success('Your request for a new Doctor transaction has been broadcast to the network. It will take a few moments to confirm.')
            mixpanel.track('Patient Request New Doc After 24+ Hours')
            this.props.history.push(routes.PATIENTS_CASES)
          })
      }
    }

    render () {
      if (!this.props.updatedAt || !caseStale(secondsInADay * 2, this.props.updatedAt, this.props.status)) {
        return null
      } else {
        return (
          <div className="alert alert-warning text-center">
            <br />
            24 hours has passed and the Doctor has yet to respond to your case.
            <br />You can close the case and withdraw your deposit:
            <br />

            <Button
              disabled={this.state.loading}
              onClick={this.handlePatientWithdraw}
              className="btn btn-sm btn-clear"
            >
              Close Case &amp; Withdraw Funds
            </Button>
            <Button
              disabled={this.state.loading}
              onClick={this.handlePatientRequestNewDoctor}
              className="btn btn-sm btn-clear"
            >
              Assign to Another Doctor
            </Button>
            <br />
            <br />
          </div>
        )
      }
    }
  }
)))

export const PatientTimeActionsContainer = withRouter(PatientTimeActions)
