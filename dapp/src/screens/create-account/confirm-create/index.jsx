import React from 'react'
import { SignInForm } from '@/components/sign-in-form'

export const ConfirmCreate = ({ onConfirm, account }) => {
  return (
    <div className='container'>
      <div className='row'>
        <div className='col-sm-8 col-sm-offset-2'>
          <h1 className='text-center'>
            You're ready!
          </h1>
          <h3>Confirm your password to create your account</h3>
          <SignInForm onSubmit={onConfirm} account={account}>
            <p className='text-center'>
              <input type='submit' className='btn btn-primary' value='Create Account' />
            </p>
          </SignInForm>
        </div>
      </div>
    </div>
  )
}
