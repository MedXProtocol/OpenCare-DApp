import React from 'react'
import { DrizzleComponent } from '@/components/drizzle-component'
import PropTypes from 'prop-types'
import { withCaseManager } from '@/drizzle-helpers/with-case-manager'
import { drizzleConnect } from 'drizzle-react'
import get from 'lodash.get'
import { CaseRow } from './case-row'

export const PatientCaseRow = withCaseManager(class _PatientCaseRow extends DrizzleComponent {
  drizzleInit (props) {
    this.setState({
      caseAddressKey: this.props.CaseManager.patientCases.cacheCall(props.address, props.caseIndex)
    })
  }

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
})

PatientCaseRow.propTypes = {
  caseIndex: PropTypes.number.isRequired,
  address: PropTypes.string.isRequired
}
