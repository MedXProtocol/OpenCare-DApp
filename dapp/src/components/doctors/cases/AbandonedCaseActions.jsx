import React, { Component } from 'react'
import { Button } from 'react-bootstrap'

const SECONDS_IN_A_DAY = 86400
// const UNIX_EPOCH_MILISECONDS = 1000

export const AbandonedCaseActions = class _AbandonedCaseActions extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isSubmitting: false
    }
  }

  render () {
    const hasBeenOneDay = (
      (Math.floor(Date.now() / 1000) - this.props.createdAt) > SECONDS_IN_A_DAY
    )
    const waitingOnPatient = (this.props.status === '3')

    console.log('hasBeenOneDay', hasBeenOneDay)
    console.log(this.props.status)
    console.log('waitingOnPatient', waitingOnPatient)

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
            disabled={this.state.isSubmitting}
            onClick={this.handleSubmit}
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

