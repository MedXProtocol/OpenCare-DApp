import React from 'react'
import { Link } from 'react-router-dom'
import { formatKey } from '@/services/format-key'

import './secret-key.css'

export const SecretKey = ({ secretKey, onContinue }) => {
  return (
    <div className='container'>
      <div className='row'>
        <div className='col-sm-8 col-sm-offset-2'>
          <h1 className='text-center'>
            This is your <b>Secret Key</b>
          </h1>
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
            <button className='btn btn-primary' onClick={onContinue}>Continue</button>
          </p>
          <p className='text-center'>
            Already have an account? <Link to='/sign-in'>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
