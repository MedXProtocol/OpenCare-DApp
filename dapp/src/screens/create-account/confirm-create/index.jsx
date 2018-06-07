import React from 'react'
import { SignInForm } from '@/components/sign-in-form'
import { Alert } from 'react-bootstrap'
import { connect } from 'react-redux'

export const ConfirmCreate = (({ onConfirm }) => {
  return (
    <div className='container'>
      <div className='row'>
        <div className='col-sm-8 col-sm-offset-2 text-center'>
          <h1>
            You're almost ready!
          </h1>

          <p className='lead'>
            The last thing we need to do is record your public key to the blockchain.  This key allows doctors
            to view your cases.  Once you complete the sign up, you'll be prompted with a transaction.
          </p>

          <button className='btn btn-primary btn-lg' onClick={onConfirm}>Finish Sign Up</button>
        </div>
      </div>
    </div>
  )
})
