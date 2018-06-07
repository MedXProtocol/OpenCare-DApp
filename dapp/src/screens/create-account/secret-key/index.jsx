import React from 'react'
import { Link } from 'react-router-dom'
import { BodyClass } from '~/components/BodyClass'
import { formatKey } from '~/services/format-key'

import './secret-key.css'

export const SecretKey = ({ secretKey, onContinue }) => {
  return (
    <BodyClass isDark={true}>
      <div className='container'>
        <div className='row'>
          <div className='col-sm-6 col-sm-offset-3'>
            <h3 className='text-center text-white'>
              This is your <b>Secret Key</b>:
            </h3>
            <div className="form-wrapper">
              <div className="well" role="alert">
                <div className='secret-key__key'>
                  {formatKey(secretKey)}
                </div>
              </div>
              <ol>
                <li>You’ll need this key to access your account from new devices and browsers.</li>
                <li>Don't write it down; we’re going to give you an <b>Emergency Kit</b> that contains it.</li>
              </ol>

              <p className='text-center'>
                <button className='btn btn-lg btn-primary' onClick={onContinue}>Continue</button>
              </p>
            </div>

            <div className="form-wrapper--footer">
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
