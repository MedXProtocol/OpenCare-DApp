import React, { Component } from 'react'
import { all } from 'redux-saga/effects'
import { MainLayoutContainer } from '~/layouts/MainLayout'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import FlipMove from 'react-flip-move'
import { CaseRow } from '~/components/CaseRow'
import get from 'lodash.get'
import { doctorCaseStatusToName, doctorCaseStatusToClass } from '~/utils/doctor-case-status-labels'
import { cacheCall } from '~/saga-genesis/sagas'
import { addContract } from '~/saga-genesis/sagas'
import { contractByName } from '~/saga-genesis/state-finders'
import { withSaga, cacheCallValue, withContractRegistry, withSend } from '~/saga-genesis'
import { PageTitle } from '~/components/PageTitle'
import { openCase, historicalCase } from '~/services/openOrHistoricalCaseService'
import * as routes from '~/config/routes'

function mapStateToProps(state) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  let CaseManager = contractByName(state, 'CaseManager')
  let caseCount = cacheCallValue(state, CaseManager, 'doctorCasesCount', address)

  let cases = []
  for (let caseIndex = (caseCount - 1); caseIndex >= 0; --caseIndex) {
    let caseAddress = cacheCallValue(state, CaseManager, 'doctorCaseAtIndex', address, caseIndex)
    if (caseAddress) {
      const status = cacheCallValue(state, caseAddress, 'status')
      const diagnosingDoctor = cacheCallValue(state, caseAddress, 'diagnosingDoctor')
      console.log(status, diagnosingDoctor)
      if (status && diagnosingDoctor) {
        const isDiagnosingDoctor = diagnosingDoctor === address
        cases.push({
          caseAddress,
          status,
          caseIndex,
          isDiagnosingDoctor
        })
      }
    }
  }

  return {
    address,
    caseCount,
    cases,
    CaseManager
  }
}

function* saga({ address, CaseManager }) {
  if (!address || !CaseManager) { return }
  let caseCount = yield cacheCall(CaseManager, 'doctorCasesCount', address)
  for (let caseIndex = (caseCount - 1); caseIndex >= 0; --caseIndex) {
    let caseAddress = yield cacheCall(CaseManager, 'doctorCaseAtIndex', address, caseIndex)
    yield addContract({ address: caseAddress, contractKey: 'Case' })
    yield all([
      cacheCall(caseAddress, 'status'),
      cacheCall(caseAddress, 'diagnosingDoctor')
    ])
  }
}

export const OpenCasesContainer = withContractRegistry(connect(mapStateToProps)(
  withSaga(saga, { propTriggers: ['account', 'caseCount', 'CaseManager'] })(
    withSend(class _OpenCases extends Component {

  render () {
    const openCases       = this.props.cases.filter(c => openCase(c))
    const historicalCases = this.props.cases.filter(c => historicalCase(c))

    return (
      <MainLayoutContainer>
        <PageTitle renderTitle={(t) => t('pageTitles.diagnoseCases')} />
        <div className="container">

          <div className='header-card card'>
            <div className='card-body'>
              <div className='row'>
                <div className='col-md-8 col-sm-12'>
                  <h3 className="title">
                    Diagnose Cases
                  </h3>
                  <span className="sm-block text-gray">
                    <strong>Currently Evaluating &amp; Historical</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className='col-xs-12'>
              <div className="card">
                <div className='card-body'>
                  <h5 className="title subtitle">
                    Open Cases:
                  </h5>
                  {
                    !openCases.length ?
                    <div className="blank-state">
                      <div className="blank-state--inner text-center text-gray">
                        <span>You do not have any cases assigned to you yet.</span>
                      </div>
                    </div> :
                    <FlipMove enterAnimation="accordionVertical" className="case-list">
                      {openCases.map(({caseAddress, status, caseIndex, isDiagnosingDoctor}) => {
                        const statusLabel = doctorCaseStatusToName(isDiagnosingDoctor, parseInt(status, 10))
                        const statusClass = doctorCaseStatusToClass(isDiagnosingDoctor, parseInt(status, 10))
                        return (
                          <CaseRow
                            route={routes.DOCTORS_CASES_DIAGNOSE_CASE}
                            caseAddress={caseAddress}
                            caseIndex={caseIndex}
                            statusLabel={statusLabel}
                            statusClass={statusClass}
                            key={caseIndex} />
                        )
                      })}
                    </FlipMove>
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className='col-xs-12'>
              <div className="card">
                <div className='card-body'>
                  <h5 className="title subtitle">
                    Historical Cases:
                  </h5>
                  {
                    !historicalCases.length ?
                    <div className="blank-state">
                      <div className="blank-state--inner text-center text-gray">
                        <span>You have not evaluated any cases yet.</span>
                      </div>
                    </div> :
                    <FlipMove enterAnimation="accordionVertical" className="case-list">
                      {historicalCases.map(({caseAddress, status, caseIndex, isDiagnosingDoctor}) => {
                        const statusLabel = doctorCaseStatusToName(isDiagnosingDoctor, parseInt(status, 10))
                        const statusClass = doctorCaseStatusToClass(isDiagnosingDoctor, parseInt(status, 10))
                        return (
                          <CaseRow
                            route={routes.DOCTORS_CASES_DIAGNOSE_CASE}
                            caseAddress={caseAddress}
                            caseIndex={caseIndex}
                            statusLabel={statusLabel}
                            statusClass={statusClass}
                            key={caseIndex} />
                        )
                      })}
                    </FlipMove>
                  }
                </div>
              </div>
            </div>
          </div>

        </div>
      </MainLayoutContainer>
    )
  }
}))))

OpenCasesContainer.propTypes = {
  cases: PropTypes.array.isRequired
}

OpenCasesContainer.defaultProps = {
  cases: []
}
