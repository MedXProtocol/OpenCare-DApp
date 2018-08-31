import React from 'react'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import get from 'lodash.get'
import networkIdToName from '~/utils/network-id-to-name'

function mapStateToProps(state, ownProps) {
  const networkId = get(state, 'sagaGenesis.network.networkId')
  return {
    networkId
  }
}

export const NetworkCheckModal = connect(mapStateToProps)(function({ networkId }) {
  const requiredNetworkId = process.env.REACT_APP_REQUIRED_NETWORK_ID
  console.log(networkId)
  console.log(requiredNetworkId)
  if (requiredNetworkId &&
      networkId &&
      networkId !== parseInt(requiredNetworkId, 10)) {
    var requiredNetworkName = networkIdToName(parseInt(requiredNetworkId, 10))
    var showNetworkModal = true
  }

  return (
    <Modal show={showNetworkModal}>
      <Modal.Body>
        <div className="row">
          <div className="col-xs-12 text-center">
            <h4>You must switch to the {requiredNetworkName} network</h4>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
})
