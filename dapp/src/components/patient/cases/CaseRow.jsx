import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { caseStatusToName, caseStatusToClass } from '~/utils/case-status-labels'
import {
  cacheCall,
  cacheCallValue,
  withContractRegistry,
  withSend
} from '~/saga-genesis'
import { contractByName } from '~/saga-genesis/state-finders'
import { addContract } from '~/saga-genesis/sagas'

export function mapStateToCaseRowProps(state, { caseAddress }) {
  const AccountManager = contractByName(state, 'AccountManager')
  const status = cacheCallValue(state, caseAddress, 'status')
  return {
    status,
    AccountManager
  }
}

export function* caseRowSaga({ caseAddress }) {
  if (!caseAddress) { return {} }
  yield addContract({ address: caseAddress, contractKey: 'Case' })
  yield cacheCall(caseAddress, 'status')
}

export const CaseRowContainer = withContractRegistry(withSend(class _CaseRow extends Component {
  render () {
    if (!this.props.status) { return <tr></tr> }

    const status = +(this.props.status || '0')

    return (
      <tr>
        <td width="5%" className="text-center">{this.props.caseIndex+1}</td>
        <td className="eth-address text">
          <span>
            <Link to={`/patients/cases/${this.props.caseAddress}`}>{this.props.caseAddress}</Link>
          </span>
        </td>
        <td width="15%" className="td--status">
          <label className={`label label-${caseStatusToClass(status)}`}>
            {caseStatusToName(status)}
          </label>
        </td>
        <td width="15%" className="td-actions text-right">
        </td>
      </tr>
    )
  }
}))

CaseRowContainer.propTypes = {
  caseAddress: PropTypes.string,
  caseIndex: PropTypes.any
}
