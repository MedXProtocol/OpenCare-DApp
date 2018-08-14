import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import FlipMove from 'react-flip-move'
import { all } from 'redux-saga/effects'
import { withSaga, withContractRegistry, cacheCallValue } from '~/saga-genesis'
import { cacheCall } from '~/saga-genesis/sagas'
import { contractByName } from '~/saga-genesis/state-finders'
import { CaseRow } from '~/components/CaseRow'
import { LoadingLines } from '~/components/LoadingLines'
import { ScrollToTop } from '~/components/ScrollToTop'
import { addPendingTxs } from '~/services/pendingTxs'
import rangeRight from 'lodash.rangeright'
import get from 'lodash.get'
import * as routes from '~/config/routes'

function mapStateToProps(state) {
  let caseAddresses = []
  const address = get(state, 'sagaGenesis.accounts[0]')
  const CaseManager = contractByName(state, 'CaseManager')
  const transactions = state.sagaGenesis.transactions
  let caseCount = cacheCallValue(state, CaseManager, 'getPatientCaseListCount', address)
  if (caseCount) {
    caseCount = parseInt(caseCount, 10)
  }

  caseAddresses = rangeRight(caseCount).reduce((accumulator, index) => {
    const caseAddress = cacheCallValue(state, CaseManager, 'patientCases', address, index - 1)
    if (caseAddress) {
      accumulator.push(caseAddress)
    }
    return accumulator
  }, [])

  return {
    address,
    caseCount,
    caseAddresses,
    CaseManager,
    transactions
  }
}

function* saga({ address, CaseManager }) {
  if (!address || !CaseManager) { return }
  const caseCount = yield cacheCall(CaseManager, 'getPatientCaseListCount', address)
  const indices = rangeRight(caseCount)
  yield all(indices.map(function* (index) {
    yield cacheCall(CaseManager, 'patientCases', address, index)
  }))
}

function renderCaseRows(caseAddresses, transactions, caseCount) {
  let caseRows = caseAddresses.map((caseAddress, index) => {
    return (
      <CaseRow
        objIndex={index+1}
        caseAddress={caseAddress}
        key={`open-case-row-${index}`}
        route={routes.PATIENTS_CASE}
        context='patient'
      />
    )
  })

  caseRows = addPendingTxs(caseRows, transactions, caseCount)

  return caseRows
}

export const PatientCases = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['account', 'CaseManager', 'caseCount']})(class _PatientCases extends Component {
  render() {
    let loadingLines, noCases, caseRows
    const { caseAddresses, caseCount, transactions } = this.props
    const loading = (this.props.caseCount === undefined)

    if (loading) {
      loadingLines = (
        <div className="blank-state">
          <div className="blank-state--inner text-center text-gray">
            <span><LoadingLines visible={true} /></span>
          </div>
        </div>
      )
    } else if (!caseAddresses.length) {
      noCases = (
        <div className="blank-state">
          <div className="blank-state--inner text-center text-gray">
            <span>You do not have any historical or pending cases.</span>
          </div>
        </div>
      )
    } else {
      caseRows = (
        <div>
          <h5 className="title subtitle">
            Current Cases:
          </h5>
          <FlipMove
            enterAnimation="accordionVertical"
            leaveAnimation="accordionVertical"
            className="case-list"
          >
            {renderCaseRows(caseAddresses, transactions, caseCount)}
          </FlipMove>
        </div>
      )
    }

    return (
      <div className="card">
        <ScrollToTop />
        <div className="card-body">
          {loadingLines}
          {noCases}
          {caseRows}
        </div>
      </div>
    )
  }
})))

export const PatientCasesContainer = withRouter(PatientCases)
