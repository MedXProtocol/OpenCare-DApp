import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Button, Modal } from 'react-bootstrap'
import get from 'lodash.get'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faPrint from '@fortawesome/fontawesome-free-solid/faPrint';
import faEnvelope from '@fortawesome/fontawesome-free-solid/faEnvelope';
import { BodyClass } from '~/components/BodyClass'
import { formatSecretKey } from '~/services/format-secret-key'
import * as routes from '~/config/routes'
import { ScrollToTopOnMount } from '~/components/ScrollToTopOnMount'

function mapStateToProps(state) {
  let address = get(state, 'sagaGenesis.accounts[0]')

  return {
    address
  }
}

export const SecretKey = class extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showTermsModal: false
    }
  }

  handleEmail = (e) => {
    e.preventDefault()

    let subject = 'Important! Hippocrates Secret Key -- KEEP THIS SAFE!'
    let body    = `Dear Hippocrates user,%0A%0AYour secret key data is encrypted and stored safe using this secret key:%0A%0A${formatSecretKey(this.props.secretKey)}%0A%0AFor ETH address: ${this.props.address}%0A%0A%0AKeep this somewhere safe and secure, and use it to log in to Hippocrates from any other browser.%0A%0AThanks for using Hippocrates!%0A- The MedCredits Team`

    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank', 'noopener');
  }

  handlePrint = (e) => {
    e.preventDefault()
    window.print()
  }

  handleCloseTermsModal = (event) => {
    event.preventDefault();
    this.setState({ showTermsModal: false });
  }

  render () {
    return (
      <BodyClass isDark={true}>
        <ScrollToTopOnMount />
        <div className='container'>
          <div className='row'>
            <div className='col-sm-8 col-sm-offset-2'>
              <h3 className='text-center text-white'>
                This is your <b>Secret Key</b>:
              </h3>
              <div className="form-wrapper form-wrapper--inverse form-wrapper--account">
                <div className="form-wrapper--body">
                  <div className="well" role="alert">
                    <div className='secret-key__key'>
                      {formatSecretKey(this.props.secretKey)}
                    </div>
                  </div>
                  <p className="small text-center">
                    <span className="eth-address text-gray">For eth address: {this.props.address}</span>
                  </p>
                  <p>
                    You will need this key to access your account from new devices and browsers.
                    Without it you <em>will not</em> be able to view your previous cases. Save
                    it in a password manager, print it or send it to yourself via email:
                  </p>
                  <div className="visible-sm visible-md visible-lg">
                    <div className="text-center">
                      <a onClick={this.handlePrint} className="btn btn-lg btn-success">
                        <FontAwesomeIcon
                          icon={faPrint}
                          size='lg' /> &nbsp;
                        Print or save as PDF
                      </a>
                    </div>
                  </div>
                  <div className="visible-xs">
                    <div className="text-center">
                      <a onClick={this.handleEmail} className="btn btn-success">
                        <FontAwesomeIcon
                          icon={faEnvelope} />&nbsp;
                        Send Key To Your Email
                      </a>
                    </div>
                  </div>

                  <hr />
                  <p>
                    By signing up you are agreeing to the terms:
                    &nbsp;<a onClick={(e) => this.setState({ showTermsModal: true })}>READ TERMS</a>
                  </p>
                </div>

                <div className="form-wrapper--footer">
                  <div className='text-right'>
                    <button
                      className='btn btn-lg btn-primary'
                      onClick={this.props.onContinue}>
                      Continue
                    </button>
                  </div>
                </div>
              </div>

              <div className="account--extras">
                <p className='text-center text-white'>
                  Already have an account? <Link to={routes.SIGN_IN} className='text-white'>Sign in</Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        <Modal show={this.state.showTermsModal}>
          <Modal.Header>
             <Modal.Title>
                Disclaimer:
              </Modal.Title>
           </Modal.Header>
          <Modal.Body>
            <p>
              Hippocrates is a decentralized application serving as an open bulletin
              board connecting users to dermatologists. The MedCredits team does not control or view
              user-physician encounters. Physician credentials are verified by nodes in the MedCredits’
              Token Curated Registry. The MedCredits team does not guarantee physician credentials nor
              control which physicians are able to participate in this decentralized application.
              Client side HIPAA-compliant encryption is used in an effort to maintain user confidentiality.
              However, we strongly advise users to avoid using any identifiers or images that
              could compromise confidentiality.  The Hippocrates app is in Beta, and users are urged to
              treat the application as such.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={this.handleCloseTermsModal}
              bsStyle="primary">
              OK
            </Button>
          </Modal.Footer>
        </Modal>
      </BodyClass>
    )
  }
}

export const SecretKeyContainer = connect(mapStateToProps)(SecretKey)
