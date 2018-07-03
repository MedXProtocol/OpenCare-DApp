import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { ErrorModal } from '~/components/ErrorModal'
import * as routes from '~/config/routes'

export class OverrideDisallowedModal extends Component {
  static propTypes = {
    show: PropTypes.bool,
    onOk: PropTypes.func.isRequired
  }
  render () {
    return (
      <ErrorModal show={this.props.show} onHide={this.props.onOk}>
        <p>
          You already have an account for this address and you cannot override it.
          Please enter your original secret key and master password on the <Link to={routes.SIGN_IN}>sign in</Link> page.  You should have a copy in your Emergency Kit.
        </p>
      </ErrorModal>
    )
  }
}
