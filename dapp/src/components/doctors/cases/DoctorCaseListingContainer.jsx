import React, {
  Component
} from 'react'
import {
  populateCases,
  populateCasesSaga
} from '~/services/populateCases'
import { DoctorCaseListing } from '~/components/doctors/DoctorCaseListing'
import { addOrUpdatePendingTxs } from '~/services/addOrUpdatePendingTxs'
import { connect } from 'react-redux'
import {
  withSaga,
  contractByName
} from '~/saga-genesis'

function mapStateToProps(state, { openCaseAddresses, openCaseCount, historicalCaseAddresses, closedCaseCount }) {
  const CaseManager = contractByName(state, 'CaseManager')
  const transactions = state.sagaGenesis.transactions
  const openCases = addOrUpdatePendingTxs(transactions, populateCases(state, openCaseAddresses, openCaseCount))
  const historicalCases = populateCases(state, historicalCaseAddresses, closedCaseCount)
  return {
    CaseManager,
    openCases,
    historicalCases
  }
}

function* saga({ CaseManager, openCaseAddresses, openCaseCount, historicalCaseAddresses, closedCaseCount }) {
  if (!CaseManager) { return }
  yield populateCasesSaga(CaseManager, openCaseAddresses, openCaseCount)
  yield populateCasesSaga(CaseManager, historicalCaseAddresses, closedCaseCount)
}

export const DoctorCaseListingContainer = connect(mapStateToProps)(
  withSaga(saga)(
    class _DoctorCaseListingContainer extends Component {
      render () {
        return <DoctorCaseListing
          openCases={this.props.openCases}
          paginatedHistoricalCases={this.props.historicalCases}
          pageNumbers={this.props.pageNumbers}
          currentPageNumber={this.props.currentPageNumber}
        />
      }
    }
  )
)
