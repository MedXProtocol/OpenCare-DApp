import React, { Component } from 'react'
import { Alert, Modal } from 'react-bootstrap'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faExclamationTriangle from '@fortawesome/fontawesome-free-solid/faExclamationTriangle';
import PropTypes from 'prop-types'

export class OverrideModal extends Component {
  static propTypes = {
    show: PropTypes.bool,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired
  }
  render () {
    return (
      <ErrorModal
        show={this.props.show}
        onHide={this.props.onCancel}
        title='Warning'
        bsStyle='warning'
        icon={faExclamationTriangle}
        modalFooter={
          <Modal.Footer>
            <button onClick={this.props.onCancel} className="btn btn-lg btn-link">Cancel</button>
            <button onClick={this.props.onConfirm} className="btn btn-lg btn-primary">Continue</button>
          </Modal.Footer>
        }>
        <div className="row">
          <div className="col-xs-12">
            <p>
              By entering a new secret key you are about to overwrite an existing secret key for this address.  You will lose access to any cases that have been encrypted using your existing secret key.
            </p>
            <p>
              You can find your existing secret key in your <b>Emergency Kit</b>.  Your emergency kit is available under the profile menu when you are signed in.
            </p>
            <p className='lead'>
              Are you sure you want to continue?
            </p>
          </div>
        </div>
      </ErrorModal>
    )
  }
}
