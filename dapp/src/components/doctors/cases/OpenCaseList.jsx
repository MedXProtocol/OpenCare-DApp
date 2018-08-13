import React, {
  Component
} from 'react'
import { connect } from 'react-redux'
import {
  withSaga,
  contractByName
} from '~/saga-genesis'
import { CaseRows } from './CaseRows'

function mapStateToProps(state) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const CaseManager = contractByName(state, 'CaseManager')

  let openCaseCount = cacheCallValue(state, CaseManager, 'openCaseCount', address)
  const openCaseAddresses = []

  let currentNodeId = cacheCallValue(state, CaseManager, 'firstOpenCaseId', address)
  while (currentNodeId) {
    let caseAddress = cacheCallValue(state, CaseManager, 'openCaseAddress', address, currentNodeId)
    if (caseAddress) {
      openCaseAddresses.push(caseAddress)
    }
    currentNodeId = cacheCallValue(state, CaseManager, 'nextOpenCaseId', address, currentNodeId)
  }

  return {
    openCaseAddresses
  }
}

function* saga() {
  throw new Error('not implatmendlaksd')
}

export const OpenCaseList = connect(mapStateToProps)(
  withSaga(saga)(
    class _OpenCaseList extends Component {
      render () {
        return <CaseRows caseAddresses={this.props.openCaseAddresses} />
      }
    }
  )
)
