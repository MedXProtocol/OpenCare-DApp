import React, { Component } from 'react'
import { connect } from 'react-redux'
import FlipMove from 'react-flip-move'
import PropTypes from 'prop-types'
import { DiagnoseCaseContainer } from '~/components/doctors/diagnose'
import { DoctorCaseListingContainer } from '~/components/doctors/cases/DoctorCaseListingContainer'
import { PageTitle } from '~/components/PageTitle'
import { ScrollToTop } from '~/components/ScrollToTop'
import { addOrUpdatePendingTxs } from '~/services/addOrUpdatePendingTxs'
import { formatRoute } from 'react-router-named-routes'
import { openCase, historicalCase } from '~/services/openOrHistoricalCaseService'
import {
  cacheCallValue,
  contractByName,
  withSaga,
  cacheCall
} from '~/saga-genesis'
import { isBlank } from '~/utils/isBlank'
import range from 'lodash.range'
import get from 'lodash.get'
import * as routes from '~/config/routes'

const MAX_CASES_PER_PAGE = 5

function mapStateToProps(state, { match }) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const CaseManager = contractByName(state, 'CaseManager')
  const transactions = state.sagaGenesis.transactions

  let openCaseCount = cacheCallValue(state, CaseManager, 'openCaseCount', address)
  const openCaseAddresses = []

  let currentNodeId = cacheCallValue(state, CaseManager, 'firstOpenCaseId', address)
  while (currentNodeId && currentNodeId !== '0') {
    const openCaseAddress = cacheCallValue(state, CaseManager, 'openCaseAddress', address, currentNodeId)
    if (openCaseAddress && !isBlank(openCaseAddress)) {
      openCaseAddresses.push(openCaseAddress)
    }
    currentNodeId = cacheCallValue(state, CaseManager, 'nextOpenCaseId', address, currentNodeId)
  }

  let closedCaseCount = cacheCallValue(state, CaseManager, 'closedCaseCount', address)
  if (closedCaseCount) {
    closedCaseCount = parseInt(closedCaseCount, 10)
  } else {
    closedCaseCount = 0
  }

  const { pageNumber } = match.params || 1
  const start = ((parseInt(pageNumber, 10) - 1) * MAX_CASES_PER_PAGE)
  const end = start + MAX_CASES_PER_PAGE
  let historicalCaseAddresses = []
  if (closedCaseCount) {
    for (var i = start; i < end; i++) {
      const closedCaseAddress = cacheCallValue(state, CaseManager, 'closedCaseAtIndex', address, i)
      if (closedCaseAddress && !isBlank(closedCaseAddress)) {
        historicalCaseAddresses.push(closedCaseAddress)
      } else {
        break
      }
    }
  }

  return {
    address,
    CaseManager,
    closedCaseCount,
    openCaseCount,
    openCaseAddresses,
    historicalCaseAddresses,
    transactions,
    pageNumber,
    start,
    end
  }
}

function* saga({ address, CaseManager, start, end }) {
  if (!address || !CaseManager) { return }

  yield cacheCall(CaseManager, 'openCaseCount', address)
  let currentNodeId = yield cacheCall(CaseManager, 'firstOpenCaseId', address)
  while (currentNodeId && currentNodeId !== '0') {
    yield cacheCall(CaseManager, 'openCaseAddress', address, currentNodeId)
    currentNodeId = yield cacheCall(CaseManager, 'nextOpenCaseId', address, currentNodeId)
  }
  yield cacheCall(CaseManager, 'closedCaseCount', address)

  yield range(start, end).map(function* (index) {
    yield cacheCall(CaseManager, 'closedCaseAtIndex', address, index)
  })
}

export const OpenCasesContainer = connect(mapStateToProps)(
  withSaga(saga, { propTriggers: ['address', 'caseCount', 'CaseManager'] })(
    class _OpenCasesContainer extends Component {

      componentDidMount() {
        this.redirectToFirstPage(this.props)
      }

      componentWillReceiveProps(nextProps) {
        this.redirectToFirstPage(nextProps)
      }

      redirectToFirstPage = (props) => {
        if (!props.match.params.caseAddress && !props.match.params.pageNumber) {
          const firstPageRoute = formatRoute(routes.DOCTORS_CASES_OPEN_PAGE_NUMBER, { pageNumber: 1 })
          props.history.push(firstPageRoute)
        }
      }

      render () {
        let doctorCaseListing, diagnoseCase, doScrollToTop
        const {
          historicalCaseAddresses,
          openCaseCount,
          openCaseAddresses,
          closedCaseCount,
          match,
          transactions
        } = this.props

        if (match.params.caseAddress) {
          diagnoseCase = <DiagnoseCaseContainer key="diagnoseCaseContainerKey" match={match} />
        } else {
          const totalPages = Math.ceil(closedCaseCount / MAX_CASES_PER_PAGE)
          const pageNumbers = range(1, totalPages + 1)

          doctorCaseListing = <DoctorCaseListingContainer
            key="doctorCaseListing"
            openCaseAddresses={openCaseAddresses}
            historicalCaseAddresses={historicalCaseAddresses}
            openCaseCount={openCaseCount}
            closedCaseCount={closedCaseCount}
            pageNumbers={pageNumbers}
            currentPageNumber={parseInt(match.params.pageNumber, 10)}
          />
        }

        const diagnosisJustSubmitted = (
          this.previousCaseAddress
          && !match.params.caseAddress
        )
        if (diagnosisJustSubmitted) {
          doScrollToTop = true
        }
        this.previousCaseAddress = match.params.caseAddress

        return (
          <div>
            <ScrollToTop scrollToTop={doScrollToTop} />

            <PageTitle renderTitle={(t) => t('pageTitles.diagnoseCases')} />
            <FlipMove
              enterAnimation="fade"
              leaveAnimation="fade"
            >
              {diagnoseCase}
              {doctorCaseListing}
            </FlipMove>
          </div>
        )
      }
    }
  )
)

OpenCasesContainer.defaultProps = {
  openCaseAddresses: [],
  historicalCaseAddresses: []
}
