import React, { Component } from 'react'
import classnames from 'classnames'
import FlipMove from 'react-flip-move'
import { formatRoute } from 'react-router-named-routes'
import { CaseRow } from '~/components/CaseRow'
import * as routes from '~/config/routes'
import { Pagination } from '~/components/Pagination'

function renderCaseRows(caseAddresses, key) {
  const caseRows = caseAddresses.map((caseAddress, index) => {
    return (
      <CaseRow
        caseAddress={caseAddress}
        key={`${key}-case-row-${index}`}
        path={formatRoute(routes.DOCTORS_CASES_DIAGNOSE_CASE, { caseAddress })}
        context='doctor'
      />
    )
  })

  return caseRows
}

export const DoctorCaseListing = class _DoctorCaseListing extends Component {

  render() {
    const { openCaseAddresses, closedCaseAddresses, currentPage, totalPages } = this.props

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
              <div className={classnames(
                'card-body',
                /*{ 'card-body--cases__has-pagination': (totalPages > 1) }*/
              )}>
                <h5 className="title subtitle">
                  Open Cases:
                </h5>
                {
                  !openCaseAddresses.length ?
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
                    {renderCaseRows(openCaseAddresses, 'open')}
                  </FlipMove>
                }
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className='col-xs-12'>
            <div className="card">
              <div className={classnames(
                'card-body',
                { 'card-body--cases__has-pagination': (totalPages > 1) }
              )}>
                <h5 className="title subtitle">
                  Historical Cases:
                </h5>
                {
                  !closedCaseAddresses.length ?
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
                    {renderCaseRows(closedCaseAddresses, 'closed')}
                  </FlipMove>
                }
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                formatPageRoute={(number) => formatRoute(routes.DOCTORS_CASES_OPEN_PAGE_NUMBER, { currentPage: number })}
                />

            </div>
          </div>
        </div>
      </div>
    )
  }

}
