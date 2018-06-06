import React from 'react'
import { SignInForm } from '@/components/sign-in-form'
import { BodyClass } from '@/components/BodyClass'

export const ConfirmCreate = ({ onConfirm, hasAccount }) => {
  return (
    <BodyClass isDark={true}>
      <div className='signed-out'>
        <div className='container'>
          <div className='row'>
            <div className='col-sm-8 col-sm-offset-2'>
              <h3 className='text-center text-white'>
                You're ready!
                <br /><small className="small-inverse">Confirm your password to create your account</small>
              </h3>
              <div className="form-wrapper">
                <SignInForm onSubmit={onConfirm} hasAccount={hasAccount}>
                  <p className='text-right'>
                    <input type='submit' className='btn btn-lg btn-primary' value='Create Account' />
                  </p>
                </SignInForm>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BodyClass>
  )
}
