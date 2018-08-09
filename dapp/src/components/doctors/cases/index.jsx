import React, { Component } from 'react'
import { connect } from 'react-redux'
import FlipMove from 'react-flip-move'
import PropTypes from 'prop-types'
import { DiagnoseCaseContainer } from '~/components/doctors/diagnose'
import { DoctorCaseListing } from '~/components/doctors/DoctorCaseListing'
import { PageTitle } from '~/components/PageTitle'
import { ScrollToTop } from '~/components/ScrollToTop'
import { addOrUpdatePendingTxs } from '~/services/addOrUpdatePendingTxs'
import { formatRoute } from 'react-router-named-routes'
import { openCase, historicalCase } from '~/services/openOrHistoricalCaseService'
import range from 'lodash.range'
import get from 'lodash.get'
import * as routes from '~/config/routes'

const MAX_CASES_PER_PAGE = 5

function mapStateToProps(state) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const CaseManager = contractByName(state, 'CaseManager')
  const transactions = state.sagaGenesis.transactions

  // const caseCount = get(state, 'userStats.caseCount')
  let openCaseCount = cacheCallValue(state, CaseManager, 'doctorOpenCaseCount', address)
  let caseCount = cacheCallValue(state, CaseManager, 'doctorCasesCount', address)
  if (caseCount) {
    caseCount = parseInt(caseCount, 10)
  }

  // caseCount = get(state, 'userStats.caseCount')
  const openCases = populateCases(state, CaseManager, address, openCaseCount)
  const historicalCases = populateCases(state, CaseManager, address, caseCount, MAX_CASES_PER_PAGE)
  historicalCases = cases.filter(c => historicalCase(c))

  return {
    address,
    CaseManager,
    caseCount,
    openCaseCount,
    openCases,
    historicalCases,
    transactions
  }
}

function* saga({ address, CaseManager, caseCount }) {
  if (!address || !CaseManager || !caseCount) { return }

  yield populateCasesSaga(CaseManager, address, caseCount)
})

function paginateCases(historicalCases, pageNumber, perPage) {
  const start = (perPage % pageNumber) * perPage
  const offset = start + perPage

  return [...historicalCases.slice(start, offset)]
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
    const { historicalCases, openCases, caseCount, match, transactions } = this.props

    if (match.params.caseAddress) {
      diagnoseCase = <DiagnoseCaseContainer key="diagnoseCaseContainerKey" match={match} />
    } else {
      const totalPages = Math.ceil(historicalCases.length / MAX_CASES_PER_PAGE)
      const pageNumbers = range(1, totalPages + 1)

      let paginatedHistoricalCases = paginateCases(historicalCases, match.params.pageNumber, MAX_CASES_PER_PAGE)
      paginatedHistoricalCases = addOrUpdatePendingTxs(transactions, paginatedHistoricalCases, caseCount)

      doctorCaseListing = <DoctorCaseListing
        key="doctorCaseListing"
        openCases={openCases}
        paginatedHistoricalCases={paginatedHistoricalCases}
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
})

OpenCasesContainer.propTypes = {
  openCases: PropTypes.array,
  historicalCases: PropTypes.array
}

OpenCasesContainer.defaultProps = {
  openCases: [],
  historicalCases: []
}
