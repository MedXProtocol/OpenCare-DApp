import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import { TransactionStateHandler } from '~/saga-genesis/TransactionStateHandler'
import { caseStaleForOneDay } from '~/services/caseStaleForOneDay'
import { withSend } from '~/saga-genesis'
import { toastr } from '~/toastr'
import { mixpanel } from '~/mixpanel'
import * as routes from '~/config/routes'

function mapStateToProps(state, { caseAddress, caseKey }) {
  const transactions = state.sagaGenesis.transactions

  return {
    transactions
  }
}

const AbandonedCaseActions = connect(mapStateToProps)(withSend(class _AbandonedCaseActions extends Component {

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
    if (!this.props.createdAt || !caseStaleForOneDay(this.props.createdAt, this.props.status)) {
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
}))

export const AbandonedCaseActionsContainer = withRouter(AbandonedCaseActions)
