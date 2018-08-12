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

function mapStateToProps(state, { openCaseAddresses, closedCaseAddresses, closedCaseCount }) {
  const CaseManager = contractByName(state, 'CaseManager')
  const transactions = state.sagaGenesis.transactions

  let openCases = populateCases(state, openCaseAddresses)
  openCases = addOrUpdatePendingTxs(transactions, openCases)

  const closedCases = populateCases(state, closedCaseAddresses, closedCaseCount)

  return {
    CaseManager,
    openCases,
    closedCases
  }
}

function* saga({ CaseManager, openCaseAddresses, closedCaseAddresses }) {
  if (!CaseManager) { return }

  yield populateCasesSaga(CaseManager, openCaseAddresses)
  yield populateCasesSaga(CaseManager, closedCaseAddresses)
}

export const DoctorCaseListingContainer = connect(mapStateToProps)(
  withSaga(saga, { propTriggers: [ 'CaseManager', 'openCaseAddresses', 'closedCaseAddresses', 'closedCaseCount' ] })(
    class _DoctorCaseListingContainer extends Component {
      render () {
        return <DoctorCaseListing
          openCases={this.props.openCases}
          closedCases={this.props.closedCases}
          pageNumbers={this.props.pageNumbers}
          currentPageNumber={this.props.currentPageNumber}
        />
      }
    }
  )
)
