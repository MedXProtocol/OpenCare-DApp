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
import range from 'lodash.range'
import get from 'lodash.get'
import * as routes from '~/config/routes'

const MAX_CASES_PER_PAGE = 5

function mapStateToProps(state) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const caseCount = get(state, 'userStats.caseCount')
  const transactions = state.sagaGenesis.transactions

  return {
    address,
    caseCount,
    transactions
  }
}

// page1
// 0, 4
// page2
// 5, 9
function paginateCases(cases, pageNumber, perPage) {
  const start = (perPage % pageNumber) * perPage
  const offset = start + perPage

  return [...cases.slice(start, offset)]
}

export const OpenCasesContainer = connect(mapStateToProps)(class _OpenCasesContainer extends Component {

  componentDidMount() {
    this.moveToFirstPage(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.moveToFirstPage(nextProps)
  }

  moveToFirstPage = (props) => {
    if (!props.match.params.caseAddress && !props.match.params.pageNumber) {
      const firstPageRoute = formatRoute(routes.DOCTORS_CASES_OPEN_PAGE_NUMBER, { pageNumber: 1 })
      props.history.push(firstPageRoute)
    }
  }

  render () {
    let doctorCaseListing, diagnoseCase, doScrollToTop
    const { cases, caseCount, match, transactions } = this.props

    if (match.params.caseAddress) {
      diagnoseCase = <DiagnoseCaseContainer key="diagnoseCaseContainerKey" match={match} />
    } else {
      const totalPages = Math.ceil(cases.length / MAX_CASES_PER_PAGE)
      const pageNumbers = range(1, totalPages + 1)

      let paginatedCases = paginateCases(cases, match.params.pageNumber, MAX_CASES_PER_PAGE)
      paginatedCases = addOrUpdatePendingTxs(transactions, paginatedCases, caseCount)
      doctorCaseListing = <DoctorCaseListing
        key="doctorCaseListing"
        cases={paginatedCases}
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
  cases: PropTypes.array.isRequired
}

OpenCasesContainer.defaultProps = {
  cases: []
}
