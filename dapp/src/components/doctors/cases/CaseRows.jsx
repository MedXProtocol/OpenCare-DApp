import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import { CaseRow } from '~/components/CaseRow'
import {
  connect
} from 'react-redux'
import { addOrUpdatePendingTxs } from '~/services/addOrUpdatePendingTxs'

function mapStateToProps(state, { caseAddresses }) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const CaseManager = contractByName(state, 'CaseManager')
  const caseCount = cacheCallValue(state, CaseManager, 'getPatientCaseListCount', address)
  const transactions = state.sagaGenesis.transactions

  const cases = caseAddresses.map((caseAddress) => {
    const status = cacheCallValue(state, caseAddress, 'status')
    const createdAt = cacheCallValue(state, caseAddress, 'createdAt')
    return {
      caseAddress,
      status,
      createdAt,
      objIndex
    }
  })

  for (let objIndex = (caseCount - 1); objIndex >= 0; --objIndex) {
    const caseAddress = cacheCallValue(state, CaseManager, 'patientCases', address, objIndex)
    if (caseAddress) {

    }
  }

  cases = addOrUpdatePendingTxs(transactions, cases)

  return {
    address,
    caseCount,
    cases,
    CaseManager
  }
}


export class CaseRows extends Component {
  static propTypes = {
    caseAddresses: PropTypes.array.isRequired
  }
  render () {

  }
}
