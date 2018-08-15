import React, { Component } from 'react'
import classnames from 'classnames'
import get from 'lodash.get'
import { connect } from 'react-redux'
import { all } from 'redux-saga/effects'
import {
  cacheCall,
  withSaga,
  cacheCallValue,
  cacheCallValueInt,
  contractByName
} from '~/saga-genesis'
import { mapOpenCaseAddresses, openCaseAddressesSaga } from '~/services/openCasesService'
import { isCaseRequiringDoctorsAttention } from '~/utils/isCaseRequiringDoctorsAttention'

function mapStateToProps (state) {
  let casesRequiringAttentionCount = 0
  const address = get(state, 'sagaGenesis.accounts[0]')
  const CaseStatusManager = contractByName(state, 'CaseStatusManager')

  const openAddresses = mapOpenCaseAddresses(state, CaseStatusManager, address)

  openAddresses.forEach(caseAddress => {
    const status = cacheCallValueInt(state, caseAddress, 'status')
    const updatedAt = cacheCallValue(state, caseAddress, 'updatedAt')
    const diagnosingDoctor = cacheCallValue(state, caseAddress, 'diagnosingDoctor')
    const isFirstDoc = diagnosingDoctor === address

    if (isCaseRequiringDoctorsAttention(isFirstDoc, status, updatedAt)) {
      casesRequiringAttentionCount++
    }
  })

  return {
    casesRequiringAttentionCount
  }
}

function* saga({ address, CaseStatusManager }) {
  if (!address || !CaseStatusManager) { return }

  const openAddresses = yield openCaseAddressesSaga(CaseStatusManager, address)

  yield openAddresses.map(function* (caseAddress) {
    yield all([
      cacheCall(caseAddress, 'status'),
      cacheCall(caseAddress, 'updatedAt'),
      cacheCall(caseAddress, 'diagnosingDoctor')
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

