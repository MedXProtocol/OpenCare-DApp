import React, { Component } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faPrint from '@fortawesome/fontawesome-free-solid/faPrint'
import faCopy from '@fortawesome/fontawesome-free-solid/faCopy'
import { formatSecretKey } from '~/services/format-secret-key'

export const PrintCopySecretKey = class extends Component {
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
          <CopyToClipboard text={formatSecretKey(this.props.secretKey)}
            onCopy={() => this.setState({ copied: true })}>
            <a className="btn btn-primary">
              <FontAwesomeIcon
                icon={faCopy}
              />&nbsp;
              Copy Key to Clipboard
            </a>
          </CopyToClipboard>
          {this.state.copied ? <span style={{color: 'red'}}>Copied.</span> : null}
        </div>
      </div>
    );
  }
}

