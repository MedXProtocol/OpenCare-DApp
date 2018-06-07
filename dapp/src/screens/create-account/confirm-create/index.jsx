import React from 'react'
import { Alert } from 'react-bootstrap'
import { connect } from 'react-redux'
import { SignInForm } from '~/components/sign-in-form'
import { BodyClass } from '~/components/BodyClass'

function mapStateToProps(state) {
  return {
    masterPasswordError: state.account.masterPasswordError,
    secretKeyError: state.account.secretKeyError
  }
}

export const ConfirmCreate = connect(mapStateToProps)(({ onConfirm, masterPasswordError, secretKeyError }) => {
  if (masterPasswordError) {
    var mpError = <Alert bsStyle='danger'>{masterPasswordError}</Alert>
  }
  if (secretKeyError) {
    var skError = <Alert bsStyle='danger'>{secretKeyError}</Alert>
  }
  return (
    <BodyClass isDark={true}>
      <div className='container'>
        <div className='row'>
          <div className='col-sm-6 col-sm-offset-3 text-center'>
            <h1>
              You're almost ready!
            </h1>

            <p className='lead'>
              The last thing we need to do is record your public key to the blockchain.  This key allows doctors
              to view your cases.  Once you complete the sign up, you'll be prompted with a transaction.
            </p>

            <button className='btn btn-primary btn-lg' onClick={onConfirm}>Finish Sign Up</button>

            {mpError}
            {skError}
          </div>
        </div>
      </div>
    </BodyClass>
  )
})
