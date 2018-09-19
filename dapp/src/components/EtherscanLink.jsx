import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import get from 'lodash.get'

function mapStateToProps(state) {
  const networkId = get(state, 'sagaGenesis.network.networkId')
  return {
    networkId
  }
}

export const EtherscanLink = connect(mapStateToProps)(class _EtherscanLink extends Component {
  static propTypes = {
    address: PropTypes.string.isRequired,
    networkId: PropTypes.number
  }

  render () {
    var url
    switch(this.props.networkId) {
      case 1:
        url = `https://etherscan.io/address/${this.props.address}`
        break
      case 3:
        url = `https://ropsten.etherscan.io/address/${this.props.address}`
        break
      case 4:
        url = `https://rinkeby.etherscan.io/address/${this.props.address}`
        break
      case 42:
        url = `https://kovan.etherscan.io/address/${this.props.address}`
        break
      case 1234:
        url = `https://localhost.etherscan.io/address/${this.props.address}`
        break
      // no default
    }

    var link = null
    if (url) {
      link =
        <a href={url} title='Etherscan' target="_blank" rel="noopener noreferrer">
          {this.props.children}
        </a>
    }

    return link
  }
})
