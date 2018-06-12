// import React, { Component } from 'react'
// import PropTypes from 'prop-types'
// import get from 'lodash.get'
// import { CaseRow } from './case-row'
// import { connect } from 'react-redux'
// import { withContractRegistry, cacheCallValue, withSaga } from '~/saga-genesis'
// import { cacheCall } from '~/saga-genesis/sagas'
// import { contractByName } from '~/saga-genesis/state-finders'

// function mapStateToProps(state, { address, caseIndex }) {
//   let CaseManager = contractByName(state, 'CaseManager')
//   let caseAddress = cacheCallValue(state, CaseManager, 'patientCases', address, caseIndex)
//   return {
//     caseAddress,
//     CaseManager
//   }
// }

// function* saga({ address, caseIndex, CaseManager }) {
//   yield cacheCall(CaseManager, 'patientCases', address, caseIndex)
// }

// export const PatientCaseRow = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['address', 'caseIndex'] })(class _PatientCaseRow extends Component {
//   render () {
//     var caseRow = <tr></tr>
//     if (this.props.caseAddress) {
//       var caseRow = <CaseRow caseAddress={this.props.caseAddress} caseIndex={this.props.caseIndex} />
//     }
//     return caseRow
//   }
// })))

// PatientCaseRow.propTypes = {
//   caseIndex: PropTypes.number.isRequired,
//   address: PropTypes.string.isRequired
// }
