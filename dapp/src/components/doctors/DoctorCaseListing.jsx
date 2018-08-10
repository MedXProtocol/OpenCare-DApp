import React, { Component } from 'react'
import FlipMove from 'react-flip-move'
import { Link } from 'react-router-dom'
import { formatRoute } from 'react-router-named-routes'
import classnames from 'classnames'
import { CaseRow } from '~/components/CaseRow'
import { caseStaleForOneDay } from '~/services/caseStaleForOneDay'
import { doctorCaseStatusToName, doctorCaseStatusToClass } from '~/utils/doctorCaseStatusLabels'
import * as routes from '~/config/routes'

export const DoctorCaseListing = class _DoctorCaseListing extends Component {

  renderCase = (caseRowObject) => {
    caseRowObject['statusLabel'] = doctorCaseStatusToName(caseRowObject)
    caseRowObject['statusClass'] = doctorCaseStatusToClass(caseRowObject)

    if (caseStaleForOneDay(caseRowObject.createdAt, caseRowObject.status)) {
      caseRowObject['statusLabel'] = 'Requires Attention'
      caseRowObject['statusClass'] = 'warning'
    }

    return (
      <CaseRow
        key={caseRowObject.objIndex}
        route={routes.DOCTORS_CASES_DIAGNOSE_CASE}
        caseRowObject={caseRowObject}
      />
    )
  }

  render() {
    const { openCases, paginatedHistoricalCases, currentPageNumber, pageNumbers } = this.props

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
                    {openCases.map(c => this.renderCase(c))}
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
                  !paginatedHistoricalCases.length ?
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
                    {paginatedHistoricalCases.map(c => this.renderCase(c))}
                  </FlipMove>
                }
              </div>

              <nav aria-label="Page navigation" className="text-center">
                <ul className="pagination">
                  {pageNumbers.map(function(number) {
                    const path = formatRoute(routes.DOCTORS_CASES_OPEN_PAGE_NUMBER, { pageNumber: number })

                    return (
                      <li
                        key={`page-number-${number}`}
                        className={classnames(
                          'pagination--page-number',
                          { 'active': currentPageNumber === number }
                        )}
                      >
                        <Link to={path}>
                          {number}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    )
  }

}
