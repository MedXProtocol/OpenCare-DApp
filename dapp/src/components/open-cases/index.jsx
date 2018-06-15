import React, {
  Component
} from 'react'
import { MainLayoutContainer } from '~/layouts/MainLayout.js'
import {
  Button,
  Table
} from 'react-bootstrap'
import ReactTooltip from 'react-tooltip'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { withSaga, cacheCallValue, withContractRegistry, withSend } from '~/saga-genesis'
import { cacheCall } from '~/saga-genesis/sagas'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faEdit from '@fortawesome/fontawesome-free-solid/faEdit';
import faNotesMedical from '@fortawesome/fontawesome-free-solid/faNotesMedical';
import { CaseRow } from './CaseRow'
import keys from 'lodash.keys'
import get from 'lodash.get'
import { contractByName } from '~/saga-genesis/state-finders'

function mapStateToProps(state) {
  const account = get(state, 'sagaGenesis.accounts[0]')
  let CaseManager = contractByName(state, 'CaseManager')
  const openCaseCount = cacheCallValue(state, CaseManager, 'openCaseCount')
  let caseCount = cacheCallValue(state, CaseManager, 'doctorAuthorizationRequestCount', account)
  let cases = []
  for (let i = 0; i < caseCount; i++) {
    let c = cacheCallValue(state, CaseManager, 'doctorAuthorizationRequestCaseAtIndex', account, i)
    if (c) { cases.push(c) }
  }
  const peekNextCase = cacheCallValue(state, CaseManager, 'peekNextCase')

  return {
    account,
    openCaseCount,
    caseCount,
    cases,
    CaseManager,
    peekNextCase
  }
}

function* saga({ account, CaseManager }) {
  if (!account || !CaseManager) { return }
  yield cacheCall(CaseManager, 'openCaseCount')
  let caseCount = yield cacheCall(CaseManager, 'doctorAuthorizationRequestCount', account)
  for (let i = 0; i < caseCount; i++) {
    yield cacheCall(CaseManager, 'doctorAuthorizationRequestCaseAtIndex', account, i)
  }
  yield cacheCall(CaseManager, 'peekNextCase')
}

export const OpenCasesContainer = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['account', 'caseCount', 'CaseManager'] })(withSend(class _OpenCases extends Component {
  handleRequestCase = (e) => {
    const { send, CaseManager } = this.props
    send(CaseManager, 'requestNextCase')()
  }

  render () {
    let caseKeys = keys(this.props.cases)
    let cases = caseKeys.reverse().map((key) => this.props.cases[key])
    let noCasesAvailableForDoc = (parseInt(this.props.peekNextCase, 16) === 0)

    return (
      <MainLayoutContainer>
        <div className="container">
          <div className='header-card card'>
            <div className='card-body'>
              <div className='row'>
                <div className='col-md-8 col-sm-12'>
                  <h3 className="title">
                    Diagnose Cases
                  </h3>
                  <span className="sm-block text-gray">
                    Cases you are currently evaluating &amp; have diagnosed
                  </span>
                </div>
                <div className='col-md-4 col-sm-12 button-container'>
                  <span
                    data-tip=''
                    data-for='button-tooltip'>
                    <Button
                      disabled={noCasesAvailableForDoc}
                      onClick={this.handleRequestCase}
                      bsStyle="info">
                      <FontAwesomeIcon
                        icon={faNotesMedical}
                        size='lg' /> &nbsp; Request Case
                    </Button>
                  </span>
                  <ReactTooltip
                    id='button-tooltip'
                    effect='solid'
                    getContent={() => noCasesAvailableForDoc ? 'Currently no cases available' : undefined } />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className='col-xs-12'>
              <div className="card">
                <div className='card-body'>
                  <Table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Address</th>
                        <th>Status</th>
                        <th className="text-right">
                          <FontAwesomeIcon icon={faEdit} />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <TransitionGroup component={null}>
                        {
                          cases.map(address => (
                            <CSSTransition
                              key={address}
                              timeout={500}
                              appear={true}
                              classNames="fade">
                              <CaseRow address={address} key={address} />
                            </CSSTransition>
                          ))
                        }
                      </TransitionGroup>
                    </tbody>
                  </Table>
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
