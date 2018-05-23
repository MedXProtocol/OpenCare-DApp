import React, { Component } from 'react'
import PropTypes from 'prop-types'
import get from 'lodash.get'
import { CaseRow } from './case-row'
import { connect } from 'react-redux'

export const PatientCaseRow = class _PatientCaseRow extends Component {
  // drizzleInit (props) {
  //   this.setState({
  //     caseAddressKey: this.props.CaseManager.patientCases.cacheCall(props.address, props.caseIndex)
  //   })
  // }

  render () {
    var caseRow = <tr></tr>
    if (this.state.caseAddressKey) {
      var caseAddress = this.props.CaseManager.patientCases.value(this.state.caseAddressKey)
      if (caseAddress) {
        var caseRow = <CaseRow caseAddress={caseAddress} caseIndex={this.props.caseIndex} />
      }
    }

    return caseRow
  }
}

PatientCaseRow.propTypes = {
  caseIndex: PropTypes.number.isRequired,
  address: PropTypes.string.isRequired
}
