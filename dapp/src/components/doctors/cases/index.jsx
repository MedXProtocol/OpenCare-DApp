import React, { Component } from 'react'
import { connect } from 'react-redux'
import FlipMove from 'react-flip-move'
import { DiagnoseCaseContainer } from '~/components/doctors/diagnose'
import { DoctorCaseListingContainer } from '~/components/doctors/cases/DoctorCaseListingContainer'
import { PageTitle } from '~/components/PageTitle'
import { ScrollToTop } from '~/components/ScrollToTop'
import { formatRoute } from 'react-router-named-routes'
import {
  cacheCallValue,
  contractByName,
  withSaga,
  cacheCall,
  callNoCache
} from '~/saga-genesis'
import { isBlank } from '~/utils/isBlank'
import range from 'lodash.range'
import get from 'lodash.get'
import * as routes from '~/config/routes'

const MAX_CASES_PER_PAGE = 5

function mapStateToProps(state, { match }) {
  let start = 0
  let end = 0
  let pageNumbers = []

  const address = get(state, 'sagaGenesis.accounts[0]')
  const CaseStatusManager = contractByName(state, 'CaseStatusManager')

  let openCaseCount = cacheCallValue(state, CaseStatusManager, 'openCaseCount', address)
  if (openCaseCount) {
    openCaseCount = parseInt(openCaseCount, 10)
  }
  const openCaseAddresses = []

  let currentNodeId = cacheCallValue(state, CaseStatusManager, 'firstOpenCaseId', address)
  while (currentNodeId && currentNodeId !== '0') {
    const openCaseAddress = cacheCallValue(state, CaseStatusManager, 'openCaseAddress', address, currentNodeId)
    if (openCaseAddress && !isBlank(openCaseAddress)) {
      openCaseAddresses.push(openCaseAddress)
    }
    currentNodeId = cacheCallValue(state, CaseStatusManager, 'nextOpenCaseId', address, currentNodeId)
  }

  let closedCaseCount = cacheCallValue(state, CaseStatusManager, 'closedCaseCount', address)
  if (closedCaseCount) {
    closedCaseCount = parseInt(closedCaseCount, 10)
  } else {
    closedCaseCount = 0
  }

  let { currentPage } = match.params
  if (!currentPage) {
    currentPage = 1
  } else {
    currentPage = parseInt(currentPage, 10)
  }

  let closedCaseAddresses = []
  if (closedCaseCount) {
    const totalPages = Math.ceil(closedCaseCount / MAX_CASES_PER_PAGE)
    pageNumbers = range(1, totalPages + 1)

    start = (closedCaseCount - ((parseInt(currentPage, 10) - 1) * MAX_CASES_PER_PAGE))
    end = Math.max((start - MAX_CASES_PER_PAGE), 0)

    for (let i = (start - 1); i >= end; i--) {
      const closedCaseAddress = cacheCallValue(state, CaseStatusManager, 'closedCaseAtIndex', address, i)

      if (closedCaseAddress && !isBlank(closedCaseAddress)) {
        closedCaseAddresses.push(closedCaseAddress)
      } else {
        break
      }
    }
  }

  return {
    address,
    CaseStatusManager,
    closedCaseCount,
    openCaseCount,
    openCaseAddresses,
    closedCaseAddresses,
    pageNumbers,
    currentPage,
    start,
    end,
  }
}

function* saga({ address, CaseStatusManager, start, end }) {
  if (!address || !CaseStatusManager) { return }
  let openAddresses = []

  let openCaseCount = yield cacheCall(CaseStatusManager, 'openCaseCount', address)
  if (openCaseCount) {
    openCaseCount = parseInt(openCaseCount, 10)
  }
  yield cacheCall(CaseStatusManager, 'closedCaseCount', address)

  openAddresses = []
  let currentNodeId = yield cacheCall(CaseStatusManager, 'firstOpenCaseId', address)
  while (currentNodeId && currentNodeId !== '0') {
    const add = yield cacheCall(CaseStatusManager, 'openCaseAddress', address, currentNodeId)
    if (add) {
      yield openAddresses.push(add)
    }

    currentNodeId = yield cacheCall(CaseStatusManager, 'nextOpenCaseId', address, currentNodeId)
  }

  yield range(start, end).map(function* (index) {
    yield cacheCall(CaseStatusManager, 'closedCaseAtIndex', address, index - 1)
  })
}

export const OpenCasesContainer = connect(mapStateToProps)(
  withSaga(saga, { propTriggers: ['address', 'openCaseCount', 'closedCaseCount', 'currentPage', 'start', 'end'] })(
    class _OpenCasesContainer extends Component {

      componentDidMount() {
        this.redirectToFirstPage(this.props)
      }

      componentWillReceiveProps(nextProps) {
        this.redirectToFirstPage(nextProps)
      }

      redirectToFirstPage = (props) => {
        if (!props.match.params.caseAddress && !props.match.params.currentPage) {
          const firstPageRoute = formatRoute(routes.DOCTORS_CASES_OPEN_PAGE_NUMBER, { currentPage: 1 })
          props.history.push(firstPageRoute)
        }
      }

      render () {
        let doctorCaseListing, diagnoseCase, doScrollToTop
        const {
          closedCaseAddresses,
          openCaseCount,
          openCaseAddresses,
          closedCaseCount,
          match,
          currentPage,
          pageNumbers
        } = this.props

        if (match.params.caseAddress) {
          diagnoseCase = <DiagnoseCaseContainer key="diagnoseCaseContainerKey" match={match} />
        } else {
          doctorCaseListing = <DoctorCaseListingContainer
            key="doctorCaseListing"
            openCaseAddresses={openCaseAddresses}
            closedCaseAddresses={closedCaseAddresses}
            openCaseCount={openCaseCount}
            closedCaseCount={closedCaseCount}
            pageNumbers={pageNumbers}
            currentPage={currentPage}
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
  closedCaseAddresses: []
}
