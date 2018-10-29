import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { BodyClass } from '~/components/BodyClass'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { Account } from '~/accounts/Account'
import * as routes from '~/config/routes'
import { PageTitle } from '~/components/PageTitle'
import ScreenshotStep1 from '~/assets/img/screenshot-step1.png'
import ScreenshotStep2 from '~/assets/img/screenshot-step2.png'
import ScreenshotStep3 from '~/assets/img/screenshot-step3.png'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faPlayCircle from '@fortawesome/fontawesome-free-regular/faPlayCircle';

function mapStateToProps (state) {
  const networkId = get(state, 'sagaGenesis.network.networkId')
  const address = get(state, 'sagaGenesis.accounts[0]')
  const signedIn = get(state, 'account.signedIn')

  return {
    address,
    signedIn,
    account: Account.get(networkId, address)
  }
}

export const Welcome = connect(mapStateToProps)(class _Welcome extends Component {
  ropsten = () => {
    return (this.props.networkId && this.props.networkId === 3)
  }

  render () {
    let launchLink
    if (this.props.signedIn) {
      if (this.props.isDoctor && this.props.isDermatologist) {
        launchLink = routes.DOCTORS_CASES_OPEN
      } else {
        launchLink = routes.PATIENTS_CASES
      }
    } else if (this.props.account) {
      launchLink = routes.SIGN_IN
    } else {
      launchLink = routes.SIGN_UP
    }

    return (
      <BodyClass isDark={true}>
        <PageTitle renderTitle={(t) => t('pageTitles.welcome')} />

        <section className="section--bg-image">
          <div className="container">
            <div className="row">
              <div className="col-xs-12 text-center pad-mobile">
                <h1>
                  A board certified dermatology consult for $10
                </h1>
              </div>
            </div>

            <div className="row">
              <div className="col-xs-12 col-sm-offset-0 col-sm-12 pad-mobile text-center">
                <p className="section--bg-image--list">
                  No registration. Submit case instantly. Diagnosis in hours.
                </p>

                <Link
                  className="btn btn-link"
                  to={launchLink}
                >
                  <FontAwesomeIcon icon={faPlayCircle} /> Watch Video
                </Link>
              </div>
            </div>

          </div>
        </section>

        <section className="bg-white section--access">
          <div className='container'>
            <div className='row'>
              <div className='col-xs-12 col-sm-6 col-sm-offset-1 pad-mobile'>
                <h4>
                  Access dermatologists worldwide. Anywhere. Anytime.
                </h4>
              </div>
              <div className="col-xs-12 col-sm-offset-1 col-sm-3 pad-mobile">
                <Link
                  className="btn btn-lg btn-success"
                  to={launchLink}
                >
                    Submit Case
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section--screenshots">
          <div className='container'>
            <div className='row'>
              <div className='col-xs-12 col-sm-offset-1 col-sm-10 pad-mobile text-center'>
                <h1>
                  How it Works
                </h1>

                <p>
                  (Inquire at <a href="mailto:contact@medxprotocol.com">contact@medxprotocol.com</a> for instant free trial consultations)
                </p>
                <br />
              </div>
            </div>

            <div className='row'>
              <div className='col-xs-12 col-md-offset-1 col-md-3 col-custom-md-3 pad-mobile text-center'>
                <img
                  src={ScreenshotStep1}
                  className="img-responsive"
                  alt="screenshot 1"
                />
                <h3>
                  Snap a photo
                </h3>
              </div>

              <div className='col-xs-12 col-md-3 col-custom-md-3 pad-mobile text-center'>
                <img
                  src={ScreenshotStep2}
                  className="img-responsive"
                  alt="screenshot 2"
                />
                <h3>
                  Enter details, payment &amp; submit
                </h3>
              </div>

              <div className='col-xs-12 col-md-3 col-custom-md-3 pad-mobile text-center'>
                <img
                  src={ScreenshotStep3}
                  className="img-responsive"
                  alt="screenshot 3"
                />
                <h3>
                  Receive diagnosis &amp; recommendation in hours
                </h3>
              </div>
            </div>
          </div>
        </section>



        <section className="bg-white section--learn-more">
          <div className='container'>
            <div className='row'>
              <div className='col-xs-12 col-md-10 col-md-offset-1 pad-mobile'>
                <h3>
                  Learn More
                </h3>
                <p>
                  For more information, refer to our blog post to learn how we provide the most affordable consultations.
                </p>

                <br />

                <h3>
                  About MedX Protocol
                </h3>

                <p>
                  MedX (formerly MedCredits) is a protocol for launching medical dApps that connect patients and physicians worldwide for medical care. Applications on the MedX protocol can be used to eliminate intermediaries and international barriers to affordable care. OpenCare (formerly Hippocrates) is the first app on MedX that reduces global disparities in medical care. For more information, please visit us at <a href="https://medxprotocol.com" title="MedX Protocl Site">https://medxprotocol.com</a>.
                </p>
              </div>
            </div>

          </div>
        </section>
      </BodyClass>
    )
  }
})
