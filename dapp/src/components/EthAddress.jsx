import React, { Component } from 'react'
import PropTypes from 'prop-types'

export const EthAddress = class _EthAddress extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showFull: props.showFull
    }
  }

  toggleFull () {
    this.setState({ showFull: !this.state.showFull })
  }

  render () {
    var address = (this.props.address === undefined) ? '?' : this.props.address.toString()
    let displayed

    if (this.props.onlyAddress) {
      return <span title={address} className='address'>{address.substring(0, 10)} ...</span>
    } else if (this.state.showFull) {
      displayed = <span className='tag address__full'>{address}</span>
    } else {
      displayed = <span onClick={() => this.toggleFull()} className="flip-link">
        {address.substring(0, 10)} ...
      </span>
    }

    return (
      <span title={address} className='address' data-tip={!this.state.showFull ? 'Show Full Address' : ''}>
        {displayed}
      </span>
    )
  }
}

EthAddress.propTypes = {
  address: PropTypes.string,
  showFull: PropTypes.bool
}

EthAddress.defaultProps = {
  showFull: false
}
