import React, { Component } from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import get from 'lodash.get'
import { connect } from 'react-redux'
import { all } from 'redux-saga/effects'
import { cacheCall } from '~/saga-genesis/sagas'
import { withSaga } from '~/saga-genesis/components'
import { cacheCallValue, contractByName } from '~/saga-genesis/state-finders'
import { isBlank } from '~/utils/isBlank'
import { caseStaleForOneDay } from '~/services/caseStaleForOneDay'

function mapStateToProps (state) {
  let casesRequiringAttentionCount = 0
  const address = get(state, 'sagaGenesis.accounts[0]')
  const CaseStatusManager = contractByName(state, 'CaseStatusManager')
  const openAddresses = []

  let currentNodeId = cacheCallValue(state, CaseStatusManager, 'firstOpenCaseId', address)
  while (currentNodeId && currentNodeId !== '0') {
    const openCaseAddress = cacheCallValue(state, CaseStatusManager, 'openCaseAddress', address, currentNodeId)
    if (openCaseAddress && !isBlank(openCaseAddress)) {
      openAddresses.push(openCaseAddress)
    }
    currentNodeId = cacheCallValue(state, CaseStatusManager, 'nextOpenCaseId', address, currentNodeId)
  }

  openAddresses.forEach(caseAddress => {
    const status = cacheCallValue(state, caseAddress, 'status')
    const updatedAt = cacheCallValue(state, caseAddress, 'updatedAt')
    const diagnosingDoctor = cacheCallValue(state, caseAddress, 'diagnosingDoctor')
    const isFirstDoc = diagnosingDoctor === address

    if (
      (isFirstDoc && status === '2')
      || (!isFirstDoc && status === '6')
      || (isFirstDoc && caseStaleForOneDay(updatedAt, status))
    ) {
      casesRequiringAttentionCount++
    }
  })

  return {
    casesRequiringAttentionCount
  }
}

function* saga({ address, CaseStatusManager }) {
  if (!address || !CaseStatusManager) { return }

  let openAddresses = []

  let currentNodeId = yield cacheCall(CaseStatusManager, 'firstOpenCaseId', address)
  while (currentNodeId && currentNodeId !== '0') {
    const caseAddress = yield cacheCall(CaseStatusManager, 'openCaseAddress', address, currentNodeId)
    if (caseAddress) {
      yield openAddresses.push(caseAddress)
    }

    currentNodeId = yield cacheCall(CaseStatusManager, 'nextOpenCaseId', address, currentNodeId)
  }


  yield openAddresses.map(function* (caseAddress) {
    yield all([
      cacheCall(caseAddress, 'status'),
      cacheCall(caseAddress, 'updatedAt')
    ])
  })
}

export const HippoCasesRequiringAttention = connect(mapStateToProps)(
  withSaga(saga)(
    class _HippoCasesRequiringAttention extends Component {

      render() {
        const { casesRequiringAttentionCount } = this.props

        return (
          <span className={classnames(
            'nav--open-cases__circle',
            {
              'nav--open-cases__not-zero': (casesRequiringAttentionCount > 0),
              'nav--open-cases__zero': (casesRequiringAttentionCount === 0),
            }
          )}> &nbsp;
            {casesRequiringAttentionCount} &nbsp;
          </span>
        )
      }

    }
  )
)

