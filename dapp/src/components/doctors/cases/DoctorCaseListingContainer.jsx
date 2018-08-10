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

  let openCases = populateCases(state, openCaseAddresses, openCaseCount)
  openCases = addOrUpdatePendingTxs(transactions, openCases)

  const historicalCases = populateCases(state, historicalCaseAddresses, closedCaseCount)
  return {
    CaseManager,
    openCases,
    historicalCases
  }
}

function* saga({ CaseManager, openCaseAddresses, historicalCaseAddresses }) {
  if (!CaseManager) { return }

  yield populateCasesSaga(CaseManager, openCaseAddresses)
  yield populateCasesSaga(CaseManager, historicalCaseAddresses)
}

export const DoctorCaseListingContainer = connect(mapStateToProps)(
  withSaga(saga, { propTriggers: [ 'CaseManager', 'openCaseAddresses', 'openCaseCount', 'historicalCaseAddresses', 'closedCaseCount' ] })(
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
