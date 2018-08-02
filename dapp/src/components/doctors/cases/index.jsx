import React, { Component } from 'react'
import { connect } from 'react-redux'
import FlipMove from 'react-flip-move'
import PropTypes from 'prop-types'
import { DiagnoseCaseContainer } from '~/components/doctors/diagnose'
import { DoctorCaseListing } from '~/components/doctors/DoctorCaseListing'
import { PageTitle } from '~/components/PageTitle'
import { ScrollToTop } from '~/components/ScrollToTop'
import { addOrUpdatePendingTxs } from '~/services/addOrUpdatePendingTxs'
import { isEmptyObject } from '~/utils/isEmptyObject'
import get from 'lodash.get'

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

export const OpenCasesContainer = connect(mapStateToProps)(class _OpenCasesContainer extends Component {

  render () {
    let doctorCaseListing, diagnoseCase, doScrollToTop
    const { cases, caseCount, match, transactions } = this.props
    const doctorCases = addOrUpdatePendingTxs(transactions, cases, caseCount)

    const diagnosisJustSubmitted = (
      this.previousCaseAddress
      && !match.params.caseAddress
    )
    if (diagnosisJustSubmitted) {
      doScrollToTop = true
    }
    this.previousCaseAddress = match.params.caseAddress

    if (isEmptyObject(match.params)) {
      doctorCaseListing = <DoctorCaseListing key="doctorCaseListing" cases={doctorCases} />
    } else {
      diagnoseCase = <DiagnoseCaseContainer key="diagnoseCaseContainerKey" match={match} />
    }

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
