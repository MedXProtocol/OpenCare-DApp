import React from 'react'
import { Link } from 'react-router-dom'
import { BodyClass } from '~/components/BodyClass'
import { formatKey } from '~/services/format-key'

export const SecretKey = ({ secretKey, onContinue }) => {
  return (
    <BodyClass isDark={true}>
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
                    {formatKey(secretKey)}
                  </div>
                </div>
                <ol>
                  <li>You’ll need this key to access your account from new devices and browsers.</li>
                  <li>Don't write it down; we’re going to give you an <b>Emergency Kit</b> that contains it.</li>
                </ol>
              </div>

              <div className="form-wrapper--footer">
                <div className='text-right'>
                  <button className='btn btn-lg btn-primary' onClick={onContinue}>Continue</button>
                </div>
              </div>
            </div>

            <div className="account--extras">
              <p className='text-center text-white'>
                Already have an account? <Link to='/sign-in' className='text-white'>Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </BodyClass>
  )
}
