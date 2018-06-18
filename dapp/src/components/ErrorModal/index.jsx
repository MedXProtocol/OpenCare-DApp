import React, { Component } from 'react'
import { Alert, Modal } from 'react-bootstrap'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faExclamationCircle from '@fortawesome/fontawesome-free-solid/faExclamationCircle';
import PropTypes from 'prop-types'

require('./ErrorModal.scss')

export class ErrorModal extends Component {
  static propTypes = {
    title: PropTypes.string,
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired
  }

  static defaultProps = {
    title: 'Error'
  }

  render () {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Body>
          <div className="row">
            <div className="col-xs-12">
              <Alert bsStyle='danger' className='error-modal_alert'>
                <h3 className='error-modal_alert_title'>
                  <FontAwesomeIcon
                    className='error-modal_alert_title_icon'
                    icon={faExclamationCircle}
                    size='2x' />
                  &nbsp;
                  Error
                </h3>
              </Alert>
            </div>
          </div>
          {this.props.children}
        </Modal.Body>
        <Modal.Footer>
          <button onClick={this.props.onHide} className="btn btn-lg btn-danger">Ok</button>
        </Modal.Footer>
      </Modal>
    )
  }
}
