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
    onHide: PropTypes.func.isRequired,
    modalFooter: PropTypes.func,
    bsStyle: PropTypes.string,
    icon: PropTypes.object
  }

  static defaultProps = {
    title: 'Error',
    bsStyle: 'danger',
    icon: faExclamationCircle
  }

  renderModalFooter () {
    let children
    if (this.props.modalFooter) {
      children = this.props.modalFooter()
    } else {
      children = (
        <Modal.Footer>
          <button
            onClick={this.props.onHide}
            className={`btn btn-lg btn-${this.props.bsStyle}`}>Ok</button>
        </Modal.Footer>
      )
    }
    return children
  }

  render () {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide} className="error-modal">
        <Modal.Header>
          <Alert bsStyle={this.props.bsStyle} className='error-modal_alert'>
            <h3 className='error-modal_alert_title'>
              <FontAwesomeIcon
                className='error-modal_alert_title_icon'
                icon={this.props.icon}
                size='2x' />
              &nbsp;
              {this.props.title}
            </h3>
          </Alert>
        </Modal.Header>
        <Modal.Body>
          {this.props.children}
        </Modal.Body>
        {this.renderModalFooter()}
      </Modal>
    )
  }
}
