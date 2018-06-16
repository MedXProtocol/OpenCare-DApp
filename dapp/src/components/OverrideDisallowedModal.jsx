import React, { Component } from 'react'
import { Alert, Modal } from 'react-bootstrap'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faExclamationCircle from '@fortawesome/fontawesome-free-solid/faExclamationCircle';
import PropTypes from 'prop-types'

export class OverrideDisallowedModal extends Component {
  static propTypes = {
    show: PropTypes.bool,
    onOk: PropTypes.func.isRequired
  }
  render () {
    return (
      <Modal show={this.props.show}>
        <Modal.Body>
          <div className="row">
            <div className="col-xs-12 text-center">
              <Alert bsStyle='danger'>
                <br />
                <FontAwesomeIcon
                  icon={faExclamationCircle}
                  size='2x' />

                <h3>
                  Error
                </h3>
              </Alert>

              <p>
                You already have an account for this address and you cannot override it.
                Please enter your original secret key and master password.  You should have a copy in your Emergency Kit.
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={this.props.onOk} className="btn btn-lg btn-primary">Ok</button>
        </Modal.Footer>
      </Modal>
    )
  }
}
