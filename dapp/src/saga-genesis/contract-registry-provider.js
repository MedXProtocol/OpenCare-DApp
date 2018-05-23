import React, { Component, Children } from 'react'
import PropTypes from 'prop-types'

export class ContractRegistryProvider extends Component {
  static propTypes = {
    contractRegistry: PropTypes.object.isRequired
  }

  static childContextTypes = {
    contractRegistry: PropTypes.object
  }

  getChildContext() {
    return {
      contractRegistry: this.props.contractRegistry
    }
  }

  render () {
    return Children.only(this.props.children)
  }
}
