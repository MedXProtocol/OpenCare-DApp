import React, { Component } from 'react'
import PropTypes from 'prop-types'
import get from 'lodash.get'
import { CaseRow } from './case-row'
import { connect } from 'react-redux'
import { getCaseManagerContract } from '@/utils/web3-util'
import { withContractRegistry, cacheCallValue, withSaga } from '@/saga-genesis'

function mapStateToProps(state, { address, caseIndex, contractRegistry }) {
  let caseManager = contractRegistry.requireAddressByName('CaseManager')
  return {
    caseAddress: cacheCallValue(state, caseManager, 'patientCases', address, caseIndex)
  }
}

function* saga({ address, caseIndex }, { cacheCall, contractRegistry }) {
  if (!contractRegistry.hasName('CaseManager')) {
    contractRegistry.add(yield getCaseManagerContract())
  }
  let caseManager = contractRegistry.requireAddressByName('CaseManager')
  yield cacheCall(caseManager, 'patientCases', address, caseIndex)
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
