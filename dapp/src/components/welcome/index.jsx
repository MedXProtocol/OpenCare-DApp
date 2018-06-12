import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Button, Checkbox, FormGroup } from 'react-bootstrap'
import { MainLayout } from '~/layouts/MainLayout'
import { BodyClass } from '~/components/BodyClass'

export const Welcome = class extends Component {
  render () {
    return (
      <BodyClass isDark={true}>
        <MainLayout doNetworkCheck={false}>
          <div className='container'>
            <div className='row'>
              <div className='col-xs-12 col-md-10 col-md-offset-1'>
                <div className="form-wrapper form-wrapper--inverse form-wrapper--account">
                  <div className="form-wrapper--body">
                    <h3>
                      Welcome to Hippocrates!
                      <br /><small>The first DApp in the MedCredits Health System</small>
                    </h3>

                    <hr />
                    <p>
                      Get a medical recommendation instantly from a global network of dermatologists, with one free evaluation during Beta testing on the <strong>Rinkeby</strong> Testnet.
                    </p>
                    <p>
                      Doctors are compensated in real MEDX for services rendered.
                    </p>
                    <ol>
                      <li>
                        Download the Metamask Chrome Extension
                      </li>
                      <li>
                        Obtain free ETH on Rinkeby Test Net from a public faucet
                      </li>
                      <li>
                        Obtain MEDX Test tokens (MEDT) from a public faucet
                      </li>
                    </ol>
                  </div>

                  <div className="form-wrapper--footer">
                    <div className='text-right'>
                      <Link
                        className="btn btn-success"
                        to='/sign-up'>
                          Launch Hippocrates
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </MainLayout>
      </BodyClass>
    )
  }
}
