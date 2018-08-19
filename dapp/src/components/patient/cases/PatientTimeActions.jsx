import React, { Component } from 'react'
import PropTypes from 'prop-types'

export const PatientTimeActions = class _PatientTimeActions extends Component {

    static propTypes = {
      caseAddress: PropTypes.string.isRequired,
      status: PropTypes.number,
      updatedAt: PropTypes.number
    }

    render () {
      if (!this.props.updatedAt || !caseStale(secondsInADay, this.props.updatedAt, this.props.status)) {
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
              Close Case &amp; Withdraw Funds
            </Button>
            <br />
            <br />
          </div>
        )
      }
    }
  }
)))
