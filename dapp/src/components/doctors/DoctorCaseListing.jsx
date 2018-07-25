import React, { Component } from 'react'
import FlipMove from 'react-flip-move'
import { CaseRow } from '~/components/CaseRow'
import { doctorCaseStatusToName, doctorCaseStatusToClass } from '~/utils/doctorCaseStatusLabels'
import { openCase, historicalCase } from '~/services/openOrHistoricalCaseService'
import * as routes from '~/config/routes'

function renderCase(caseRowObject) {
  caseRowObject['statusLabel'] = doctorCaseStatusToName(caseRowObject)
  caseRowObject['statusClass'] = doctorCaseStatusToClass(caseRowObject)
  return (
    <CaseRow
      route={routes.DOCTORS_CASES_DIAGNOSE_CASE}
      caseRowObject={caseRowObject}
      key={caseRowObject.objIndex} />
  )
}

export const DoctorCaseListing = class _DoctorCaseListing extends Component {

  render() {
    const openCases       = this.props.cases.filter(c => openCase(c))
    const historicalCases = this.props.cases.filter(c => historicalCase(c))

    return (
      <div className='container'>
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
                      <span>You do not have any cases assigned to you right now.</span>
                    </div>
                  </div> :
                  <FlipMove
                    enterAnimation="accordionVertical"
                    leaveAnimation="accordionVertical"
                    className="case-list"
                  >
                    {openCases.map(c => renderCase(c))}
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
                  <FlipMove
                    enterAnimation="accordionVertical"
                    leaveAnimation="accordionVertical"
                    className="case-list"
                  >
                    {historicalCases.map(c => renderCase(c))}
                  </FlipMove>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

}
