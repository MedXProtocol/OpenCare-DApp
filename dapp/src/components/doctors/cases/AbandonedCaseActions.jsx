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

const AbandonedCaseActions = connect(mapStateToProps)(withSend(withSaga(saga)(
  class _AbandonedCaseActions extends Component {

    static propTypes = {
      updatedAt: PropTypes.number,
      caseAddress: PropTypes.string.isRequired,
      status: PropTypes.number.isRequired
    }

    constructor(props) {
      super(props)

      this.state = {
        loading: false
      }
    }

    componentWillReceiveProps (nextProps) {
      this.forceAcceptDiagnosisHandler(nextProps)
    }

    handleForceAcceptDiagnosis = () => {
      const acceptTransactionId = this.props.send(this.props.caseAddress, 'acceptAsDoctor')()
      this.setState({
        acceptTransactionId,
        forceAcceptDiagnosisHandler: new TransactionStateHandler(),
        loading: true
      })
    }

    forceAcceptDiagnosisHandler = (props) => {
      if (this.state.forceAcceptDiagnosisHandler) {
        this.state.forceAcceptDiagnosisHandler.handle(props.transactions[this.state.acceptTransactionId])
          .onError((error) => {
            toastr.transactionError(error)
            this.setState({ forceAcceptDiagnosisHandler: null, loading: false })
          })
          .onConfirmed(() => {
            this.setState({ forceAcceptDiagnosisHandler: null, loading: false })
          })
          .onTxHash(() => {
            toastr.success('Your accept diagnosis transaction has been broadcast to the network. It will take a moment to be confirmed and then you will receive your MEDX.')
            mixpanel.track('Doctor Force Accepting After 48+ Hours')
            this.props.history.push(routes.DOCTORS_CASES_OPEN)
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
            24 hours has passed and the patient has yet to respond to your diagnosis.
            <br />You can close the case on their behalf to earn your MEDX:
            <br />
            <Button
              disabled={this.state.loading}
              onClick={this.handleForceAcceptDiagnosis}
              className="btn btn-sm btn-clear"
            >
              Close Case
            </Button>
            <br />
            <br />
          </div>
        )
      }
    }
  }
)))

export const AbandonedCaseActionsContainer = withRouter(AbandonedCaseActions)
