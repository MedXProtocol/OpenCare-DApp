import React, { Component } from 'react'
import ReactTimeout from 'react-timeout'
import CopyToClipboard from 'react-copy-to-clipboard'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faPrint from '@fortawesome/fontawesome-free-solid/faPrint'
import faCopy from '@fortawesome/fontawesome-free-solid/faCopy'
import { formatSecretKey } from '~/services/format-secret-key'

export const PrintCopySecretKey = ReactTimeout(class extends Component {
  constructor(props) {
    super(props)
    this.state = {
      copied: false
    }
  }

  handlePrint = (e) => {
    e.preventDefault()
    window.print()
  }

  handleCopy = () => {
    this.setState({ copied: true })
    this.props.setTimeout(() => {
      this.setState({ copied: false })
    }, 5000)
  }

  render () {
    return (
      <div className="row">
        <div className="col-xs-12 col-sm-6 visible-sm visible-md visible-lg text-right">
          <a onClick={this.handlePrint} className="btn btn-success">
            <FontAwesomeIcon
              icon={faPrint}
              size='lg'
            /> &nbsp;
            Print / Save as PDF
          </a>
        </div>

        <div className="col-xs-12 col-sm-6 text-center-on-xs">
          <CopyToClipboard
            text={formatSecretKey(this.props.secretKey)}
            onCopy={this.handleCopy}>
            <a className="btn btn-primary">
              <FontAwesomeIcon
                icon={faCopy}
              />&nbsp;
              {this.state.copied ? 'Copied!' : 'Copy Key to Clipboard'}
            </a>
          </CopyToClipboard>
        </div>
      </div>
    );
  }
})
