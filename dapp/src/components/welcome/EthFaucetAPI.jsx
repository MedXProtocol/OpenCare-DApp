import React, { Component } from 'react'
import { EthAddress } from '~/components/EthAddress'
import PropTypes from 'prop-types'

export const EthFaucetAPI = class extends Component {

  handleSendEther = (event) => {
    event.preventDefault()
    console.log('api call here')
  }

  render () {
    return (
      <div>
        <strong>Current Ether Balance:</strong>
        <h2 className="header--no-top-margin">
          {this.props.ethBalance} Ξ
        </h2>
        <p className="small text-center">
          <span className="eth-address text-gray">For address:&nbsp;
            <EthAddress address={this.props.address} />
          </span>
        </p>
        <hr />
        <p>
          You're low on ether, which is necessary to use Hippocrates.
          <br />Not to worry! We can have some sent to your account:
        </p>
        <p>
          <a onClick={this.handleSendEther} className="btn btn-lg btn-primary">Send Me Ether</a>
        </p>
      </div>
    )
  }
}

EthFaucetAPI.propTypes = {
  ethBalance: PropTypes.number,
  address: PropTypes.string
}
