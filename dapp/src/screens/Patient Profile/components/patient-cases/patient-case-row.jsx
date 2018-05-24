import React, { Component } from 'react'
import PropTypes from 'prop-types'
import get from 'lodash.get'
import { CaseRow } from './case-row'
import { connect } from 'react-redux'
import { getCaseManagerContract } from '@/utils/web3-util'
import { withContractRegistry, cacheCallValue, withSaga, createCall, hashCall } from '@/saga-genesis'

function mapStateToProps(state, { address, caseIndex, contractRegistry }) {
  let CaseManager = contractRegistry.requireAddressByName('CaseManager')
  let caseAddress = cacheCallValue(state, CaseManager, 'patientCases', address, caseIndex)
  return {
    caseAddress
  }
}

function* saga({ address, caseIndex }, { cacheCall, contractRegistry }) {
  let CaseManager = contractRegistry.requireAddressByName('CaseManager')
  yield cacheCall(CaseManager, 'patientCases', address, caseIndex)
}

export const PatientCaseRow = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['address', 'caseIndex'] })(class _PatientCaseRow extends Component {
  render () {
    var caseRow = <tr></tr>
    if (this.props.caseAddress) {
      var caseRow = <CaseRow caseAddress={this.props.caseAddress} caseIndex={this.props.caseIndex} />
    }
    return caseRow
  }
})))

PatientCaseRow.propTypes = {
  caseIndex: PropTypes.number.isRequired,
  address: PropTypes.string.isRequired
}
