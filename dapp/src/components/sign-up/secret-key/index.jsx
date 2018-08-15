import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Button, Modal } from 'react-bootstrap'
import get from 'lodash.get'
import { EthAddress } from '~/components/EthAddress'
import { BodyClass } from '~/components/BodyClass'
import { formatSecretKey } from '~/services/format-secret-key'
import { PrintCopySecretKey } from '~/components/PrintCopySecretKey'
import { ScrollToTop } from '~/components/ScrollToTop'
import * as routes from '~/config/routes'

function mapStateToProps(state) {
  let address = get(state, 'sagaGenesis.accounts[0]')

  return {
    address
  }
}

export const SecretKey = class _SecretKey extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showTermsModal: false
    }
  }

  handleCloseTermsModal = (event) => {
    event.preventDefault();
    this.setState({ showTermsModal: false });
  }

  render () {
    return (
      <BodyClass isDark={true}>
        <ScrollToTop />
        <div className='container'>
          <div className='row'>
            <div className='col-sm-8 col-sm-offset-2'>
              <h3 className='text-center text-white title--inverse'>
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
                    <span className="eth-address text-gray">ethereum address:&nbsp;
                      <EthAddress address={this.props.address} showFull={true} />
                    </span>
                  </p>
                  <p>
                    You will need this key to access your account from new devices and browsers.
                    Without it you <em>will not</em> be able to view your previous cases. Save
                    it in a password manager, print it or send it to yourself via email:
                  </p>

                  <PrintCopySecretKey
                    secretKey={this.props.secretKey}
                    address={this.props.address}
                  />

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

        <Modal show={this.state.showTermsModal} onHide={this.handleCloseTermsModal}>
          <Modal.Header>
             <Modal.Title>
                Disclaimer:
              </Modal.Title>
           </Modal.Header>
          <Modal.Body>
            <p>
              DermX is a decentralized application serving as an open bulletin
              board connecting users to dermatologists. The MedCredits team does not control or view
              user-physician encounters. Physician credentials are verified by nodes in the MedCredits’
              Token Curated Registry. The MedCredits team does not guarantee physician credentials nor
              control which physicians are able to participate in this decentralized application.
              Client side HIPAA-compliant encryption is used in an effort to maintain user confidentiality.
              However, we strongly advise users to avoid using any identifiers or images that
              could compromise confidentiality.  The DermX app is in Beta, and users are urged to
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
