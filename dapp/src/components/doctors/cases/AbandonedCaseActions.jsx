import React, { Component } from 'react'

export const AbandonedCaseActions = class _AbandonedCaseActions extends Component {

  render () {
    return (
      <div className="alert alert-warning">
        24 hours has passed and the patient has yet to respond to your diagnosis.
        <br />You can close the case on their behalf to earn your MEDX.
      </div>
    )
  }
}

