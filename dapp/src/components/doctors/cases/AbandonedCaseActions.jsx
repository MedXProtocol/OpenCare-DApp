import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { TransactionStateHandler } from '~/saga-genesis/TransactionStateHandler'
import { all } from 'redux-saga/effects'
import { cacheCallValue, withSaga, withSend } from '~/saga-genesis'
import { cacheCall } from '~/saga-genesis/sagas'
import { caseStaleForOneDay } from '~/services/caseStaleForOneDay'
import { toastr } from '~/toastr'
import { mixpanel } from '~/mixpanel'
import * as routes from '~/config/routes'

function mapStateToProps(state, { caseAddress, caseKey }) {
  const transactions = state.sagaGenesis.transactions

  let status = cacheCallValue(state, caseAddress, 'status')
  if (status) {
    status = parseInt(status, 10)
  }
  let updatedAt = cacheCallValue(state, caseAddress, 'updatedAt')
  if (updatedAt) {
    updatedAt = parseInt(updatedAt, 10)
  }

  return {
    transactions,
    status,
    updatedAt
  }
}

function* saga({ caseAddress }) {
  yield all([
    cacheCall(caseAddress, 'status'),
    cacheCall(caseAddress, 'updatedAt')
  ])
}

const AbandonedCaseActions = connect(mapStateToProps)(withSend(withSaga(saga, { propTriggers: ['status', 'updatedAt'] })(
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
      const acceptTransactionId = this.props.send(this.props.caseAddress, 'acceptAsDoctorAfterADay')()
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
            mixpanel.track('Doctor Force Accepting After 24 Hours')
            this.props.history.push(routes.DOCTORS_CASES_OPEN)
          })
      }
    }

    render () {
      if (!this.props.updatedAt || !caseStaleForOneDay(this.props.updatedAt, this.props.status)) {
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
