import React from 'react'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import get from 'lodash.get'
import networkIdToName from '~/utils/network-id-to-name'
import { requiredNetworkIds } from '~/services/requiredNetworkIds'

function mapStateToProps(state, ownProps) {
  const networkId = get(state, 'sagaGenesis.network.networkId')
  return {
    networkId
  }
}

export const NetworkCheckModal = connect(mapStateToProps)(function({ networkId }) {
  const networkIds = requiredNetworkIds()
  var requiredNetworkNames = []
  if (networkIds &&
      networkId &&
      networkIds.indexOf(networkId) === -1) {
    requiredNetworkNames = networkIds.map(requiredNetworkId => networkIdToName(requiredNetworkId))
    var showNetworkModal = true
  }

  return (
    <Modal show={showNetworkModal}>
      <Modal.Body>
        <div className="row">
          <div className="col-xs-12 text-center">
            <h4>You must switch to the {requiredNetworkNames.join(' or ')} network</h4>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
})
