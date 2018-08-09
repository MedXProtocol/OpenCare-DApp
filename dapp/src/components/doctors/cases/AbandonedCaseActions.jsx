import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { TransactionStateHandler } from '~/saga-genesis/TransactionStateHandler'
import { withSend } from '~/saga-genesis'
import { toastr } from '~/toastr'
import { mixpanel } from '~/mixpanel'

// const SECONDS_IN_A_DAY = 86400
const SECONDS_IN_A_DAY = 40
// const UNIX_EPOCH_MILISECONDS = 1000

export const AbandonedCaseActions = withSend(class _AbandonedCaseActions extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isSubmitting: false
    }
  }

  handleForceAcceptDiagnosis = () => {
    const acceptAsDoctorAfterADay = this.props.send(this.props.caseAddress, 'acceptAsDoctorAfterADay')()
    this.setState({
      acceptAsDoctorAfterADay,
      acceptHandler: new TransactionStateHandler(),
      loading: true
    })
  }

  acceptChallengeHandler = (props) => {
    if (this.state.acceptHandler) {
      this.state.acceptHandler.handle(props.transactions[this.state.acceptTransactionId])
        .onError((error) => {
          toastr.transactionError(error)
          this.setState({ acceptHandler: null, loading: false })
        })
        .onConfirmed(() => {
          this.setState({ acceptHandler: null, loading: false })
        })
        .onTxHash(() => {
          toastr.success('Your accept diagnosis transaction has been broadcast to the network. It will take a moment to be confirmed and then you will receive your MEDX.')
          mixpanel.track('Doctor Force Accepting After 24 Hours')
        })
    }
  }

  render () {
    const hasBeenOneDay = (
      (Math.floor(Date.now() / 1000) - this.props.createdAt) > SECONDS_IN_A_DAY
    )
    const waitingOnPatient = (this.props.status === '3')

    if (!this.props.createdAt || !hasBeenOneDay || !waitingOnPatient) {
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
})

