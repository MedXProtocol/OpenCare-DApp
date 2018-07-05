import React, {
  Component
} from 'react'
import { MainLayoutContainer } from '~/layouts/MainLayout'
import {
  Table
} from 'react-bootstrap'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { withSaga, cacheCallValue, withContractRegistry, withSend } from '~/saga-genesis'
import { cacheCall } from '~/saga-genesis/sagas'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faEdit from '@fortawesome/fontawesome-free-solid/faEdit';
import { CaseRow } from './CaseRow'
import keys from 'lodash.keys'
import get from 'lodash.get'
import { contractByName } from '~/saga-genesis/state-finders'

function mapStateToProps(state) {
  const account = get(state, 'sagaGenesis.accounts[0]')
  let CaseManager = contractByName(state, 'CaseManager')
  let caseCount = cacheCallValue(state, CaseManager, 'doctorCasesCount', account)
  let AccountManager = contractByName(state, 'AccountManager')
  const publicKey = cacheCallValue(state, AccountManager, 'publicKeys', account)

  let cases = []
  for (let i = 0; i < caseCount; i++) {
    let c = cacheCallValue(state, CaseManager, 'doctorCaseAtIndex', account, i)
    if (c) { cases.push(c) }
  }

  return {
    publicKey,
    account,
    caseCount,
    cases,
    CaseManager,
    AccountManager
  }
}

function* saga({ account, CaseManager, AccountManager }) {
  if (!account || !CaseManager) { return }
  yield cacheCall(AccountManager, 'publicKeys', account)
  let caseCount = yield cacheCall(CaseManager, 'doctorCasesCount', account)
  for (let i = 0; i < caseCount; i++) {
    yield cacheCall(CaseManager, 'doctorCaseAtIndex', account, i)
  }
}

export const OpenCasesContainer = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['account', 'caseCount', 'CaseManager'] })(withSend(class _OpenCases extends Component {
  render () {
    let caseKeys = keys(this.props.cases)
    let cases = caseKeys.reverse().map((key) => this.props.cases[key])

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
                              timeout={100}
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
