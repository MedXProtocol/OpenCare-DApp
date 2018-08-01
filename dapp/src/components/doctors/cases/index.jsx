import React, { Component } from 'react'
import ReactTimeout from 'react-timeout'
import { connect } from 'react-redux'
import FlipMove from 'react-flip-move'
import PropTypes from 'prop-types'
import { contractByName } from '~/saga-genesis/state-finders'
import { withSaga, withContractRegistry, withSend } from '~/saga-genesis'
import { DiagnoseCaseContainer } from '~/components/doctors/diagnose'
import { DoctorCaseListing } from '~/components/doctors/DoctorCaseListing'
import { PageTitle } from '~/components/PageTitle'
import { ScrollToTop } from '~/components/ScrollToTop'
import { populateCases, populateCasesSaga } from '~/services/populateCases'
import { addOrUpdatePendingTxs } from '~/services/addOrUpdatePendingTxs'
import { isEmptyObject } from '~/utils/isEmptyObject'
import get from 'lodash.get'

function mapStateToProps(state) {
  let cases = []
  const address = get(state, 'sagaGenesis.accounts[0]')
  const CaseManager = contractByName(state, 'CaseManager')
  const caseCount = get(state, 'userStats.caseCount')
  // const caseCount = cacheCallValue(state, CaseManager, 'doctorCasesCount', address)

  cases = populateCases(state, CaseManager, address, caseCount)

  cases = addOrUpdatePendingTxs(state, cases, caseCount)

  return {
    address,
    caseCount,
    cases,
    CaseManager
  }
}

function* saga({ caseCount, address, CaseManager }) {
  if (!caseCount || !address || !CaseManager) { return }

  yield populateCasesSaga(CaseManager, address, caseCount)
}

export const OpenCasesContainer = ReactTimeout(withContractRegistry(connect(mapStateToProps)(
  withSend(withSaga(saga, { propTriggers: ['address', 'caseCount', 'CaseManager'] })(class _OpenCasesContainer extends Component {

  render () {
    let doctorCaseListing, diagnoseCase, doScrollToTop
    const { match, cases } = this.props

    const diagnosisJustSubmitted = (
      this.previousCaseAddress
      && !match.params.caseAddress
    )
    if (diagnosisJustSubmitted) {
      doScrollToTop = true
    }
    this.previousCaseAddress = match.params.caseAddress

    if (isEmptyObject(match.params)) {
      doctorCaseListing = <DoctorCaseListing key="doctorCaseListing" cases={cases} />
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
})))))

OpenCasesContainer.propTypes = {
  cases: PropTypes.array.isRequired
}

OpenCasesContainer.defaultProps = {
  cases: []
}
