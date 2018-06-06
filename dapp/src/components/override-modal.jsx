import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import PropTypes from 'prop-types'

export class OverrideModal extends Component {
  static propTypes = {
    show: PropTypes.bool,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired
  }
  render () {
    return (
      <Modal show={this.props.show}>
          <Modal.Body>
              <div className="row">
                  <div className="col text-center">
                      <h3 className='warning'>
                        <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
                        Warning
                      </h3>
                      <p>
                        By entering a new secret key you are about to overwrite an existing secret key for this address.  You will lose access to any cases that have been encrypted using your existing secret key.
                      </p>
                      <p>
                        You can find your existing secret key in your <b>Emergency Kit</b>.  Your emergency kit is available under the profile menu when you are signed in.
                      </p>
                      <p className='lead'>Are you sure you want to continue?</p>
                  </div>
              </div>
          </Modal.Body>
          <Modal.Footer>
            <button onClick={this.props.onCancel} className="btn btn-default">Cancel</button>
            <button onClick={this.props.onConfirm} className="btn btn-default">Continue</button>
          </Modal.Footer>
      </Modal>
    )
  }
}
