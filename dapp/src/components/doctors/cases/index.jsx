import React, { Component } from 'react'
import { connect } from 'react-redux'
import FlipMove from 'react-flip-move'
import { all } from 'redux-saga/effects'
import { DiagnoseCaseContainer } from '~/components/doctors/diagnose'
import { DoctorCaseListing } from './DoctorCaseListing'
import { PageTitle } from '~/components/PageTitle'
import { ScrollToTop } from '~/components/ScrollToTop'
import { formatRoute } from 'react-router-named-routes'
import {
  cacheCallValue,
  cacheCallValueInt,
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
  let start = 0
  let end = 0
  let totalPages = 0

  const address = get(state, 'sagaGenesis.accounts[0]')
  const CaseStatusManager = contractByName(state, 'CaseStatusManager')

  let closedCaseCount = cacheCallValueInt(state, CaseStatusManager, 'closedCaseCount', address)
  if (!closedCaseCount) {
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
    totalPages = Math.ceil(closedCaseCount / MAX_CASES_PER_PAGE)

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

  const props = {
    address,
    CaseStatusManager,
    closedCaseAddresses,
    totalPages,
    currentPage,
    start,
    end
  }

  return props
}

function* saga({ address, CaseStatusManager, start, end }) {
  if (!address || !CaseStatusManager) { return }
  yield cacheCall(CaseStatusManager, 'closedCaseCount', address)

  yield all(range(start, end).map(function* (index) {
    yield cacheCall(CaseStatusManager, 'closedCaseAtIndex', address, index - 1)
  }))
}

export const OpenCasesContainer = connect(mapStateToProps)(
  withSaga(saga)(
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
          match,
          currentPage,
          totalPages
        } = this.props

        if (match.params.caseAddress) {
          diagnoseCase = <DiagnoseCaseContainer key="diagnoseCaseContainerKey" match={match} />
        } else {
          doctorCaseListing = (
            <DoctorCaseListing
              key="doctor-case-listing"
              closedCaseAddresses={closedCaseAddresses}
              totalPages={totalPages}
              currentPage={currentPage}
            />
          )
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
  closedCaseAddresses: []
}
