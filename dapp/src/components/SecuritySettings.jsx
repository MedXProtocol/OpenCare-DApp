import React, { Component } from 'react'
import { BodyClass } from '~/components/BodyClass'
import { Alert } from 'react-bootstrap'
import { PageTitle } from '~/components/PageTitle'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faExclamationCircle from '@fortawesome/fontawesome-free-solid/faExclamationCircle';

export const SecuritySettings = class _SecuritySettings extends Component {
  render () {
    return (
      <BodyClass isDark={true}>
        <PageTitle renderTitle={(t) => t('pageTitles.securitySettings')} />
        <div className='container'>
          <div className='row'>
            <div className='col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3'>
              <div className="form-wrapper form-wrapper--inverse form-wrapper--account">
                <Alert bsStyle='danger' className='error-modal_alert'>
                  <h3 className='error-modal_alert_title'>
                    <FontAwesomeIcon
                      className='error-modal_alert_title_icon'
                      icon={faExclamationCircle}
                      size='2x' />
                    &nbsp;
                    Browser Settings
                  </h3>
                </Alert>
                <div className="form-wrapper--body form-wrapper--body__extra-padding text-center">
                  <h3>
                    Hippocrates requires access to your local device storage
                  </h3>
                  <h4>
                     We store your private key in local storage so that no one else can see it.  Please enable local storage in your browser security settings.
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BodyClass>
    )
  }
}
