import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faExclamationTriangle from '@fortawesome/fontawesome-free-solid/faExclamationTriangle'

export class ErrorModal extends Component {
  static propTypes = {
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
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
            <div className="col-xs-12 text-center">
              <Alert bsStyle='danger'>
                <br />
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  size='2x' />
                <h3>
                  {this.props.title}
                </h3>
              </Alert>
            </div>
          </div>
          <div className='row'>
            <div className='col-xs-12'>
              <p>
                {this.props.message}
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={this.props.onHide} type="button" className="btn btn-danger">Ok</button>
        </Modal.Footer>
      </Modal>
    )
  }
}
