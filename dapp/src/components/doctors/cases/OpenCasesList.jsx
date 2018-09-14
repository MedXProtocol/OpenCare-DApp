import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { formatRoute } from 'react-router-named-routes'
import * as routes from '~/config/routes'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faArrowAltCircleLeft from '@fortawesome/fontawesome-free-regular/faArrowAltCircleLeft'
import faArrowAltCircleRight from '@fortawesome/fontawesome-free-regular/faArrowAltCircleRight'
import FlipMove from 'react-flip-move'
import { CaseRow } from '~/components/CaseRow'
import get from 'lodash.get'
import {
  withSaga,
  cacheCall,
  cacheCallValue,
  contractByName
} from '~/saga-genesis'
import { mapOpenCasePage, openCasePageSaga } from '~/services/openCasesService'

const PAGE_SIZE = 5

function mapStateToProps(state, { page }) {
  const doctorAddress = get(state, 'sagaGenesis.accounts[0]')
  const CaseStatusManager = contractByName(state, 'CaseStatusManager')
  const openCaseCount = cacheCallValue(state, 'CaseStatusManager', 'openCaseCount', doctorAddress)
  const totalPages = Math.ceil(openCaseCount / (1.0 * PAGE_SIZE))

  var openCaseNodes = null
  var nextPage = 1
  var nextNodeId = null
  while (nextPage <= page && !openCaseNodes) {
    const pageNodes = mapOpenCasePage(state, CaseStatusManager, doctorAddress, PAGE_SIZE, nextNodeId)
    if (nextPage === page) {
      openCaseNodes = pageNodes
    }
    if (pageNodes.length) {
      nextNodeId = pageNodes[pageNodes.length - 1].nextId
    }
    nextPage++
  }

  return {
    CaseStatusManager,
    openCaseCount,
    totalPages,
    doctorAddress,
    openCaseNodes
  }
}

function* openCasesListSaga({ page, CaseStatusManager, doctorAddress }) {
  if (!CaseStatusManager || !doctorAddress) { return }

  yield cacheCall(CaseStatusManager, 'openCaseCount', doctorAddress)
  var openCaseNodes = []
  var nextPage = 1
  var lastPage = false
  var nextNodeId = null
  while (nextPage <= page && !lastPage) {
    const newNodes = yield openCasePageSaga(CaseStatusManager, doctorAddress, PAGE_SIZE, nextNodeId)
    openCaseNodes = openCaseNodes.concat(newNodes)
    lastPage = newNodes.length <= PAGE_SIZE
    if (newNodes.length) {
      nextNodeId = newNodes[newNodes.length - 1].nextId
    }
    nextPage++
  }
}

export const OpenCasesList = connect(mapStateToProps)(
  withSaga(openCasesListSaga)(
    class _OpenCasesList extends Component {
      static propTypes = {
        page: PropTypes.number.isRequired,
        onNextPage: PropTypes.func.isRequired,
        onPrevPage: PropTypes.func.isRequired
      }

      static defaultProps = {
        openCaseNodes: []
      }

      hasNextPage () {
        return this.props.page < this.props.totalPages
      }

      render () {
        var nextPageLink
        if (this.hasNextPage()) {
          nextPageLink =
            <li className='pagination--page-number'>
              <a onClick={this.props.onNextPage}>
                Next <FontAwesomeIcon icon={faArrowAltCircleRight} />
              </a>
            </li>
        }

        var prevPageLink
        if (this.props.page > 1) {
          prevPageLink =
            <li className='pagination--page-number'>
              <a onClick={this.props.onPrevPage}>
                <FontAwesomeIcon icon={faArrowAltCircleLeft} /> Previous
              </a>
            </li>
        }

        return (
          <React.Fragment>
            {
              !this.props.openCaseNodes.length ?
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
                {this.props.openCaseNodes.map((nodeDetails, index) => {
                    return (
                      <CaseRow
                        caseAddress={nodeDetails.caseAddress}
                        key={`open-case-row-${index}`}
                        path={formatRoute(routes.DOCTORS_CASES_DIAGNOSE_CASE, { caseAddress: nodeDetails.caseAddress })}
                        context='doctor'
                      />
                    )
                  })
                }
              </FlipMove>
            }
            {(prevPageLink || nextPageLink) &&
              <nav aria-label="Page navigation" className="text-center">
                <ul className="pagination">
                  {prevPageLink}
                  <li className='pagination--page-number active'>
                    <a>Page {this.props.page}</a>
                  </li>
                  {nextPageLink}
                </ul>
              </nav>
            }
          </React.Fragment>
        )
      }
    }
  )
)
