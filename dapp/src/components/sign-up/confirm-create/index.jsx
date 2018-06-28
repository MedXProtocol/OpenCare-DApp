import React from 'react'
import { BodyClass } from '~/components/BodyClass'
import { LoadingLines } from '~/components/LoadingLines'
import { ScrollToTopOnMount } from '~/components/ScrollToTopOnMount'

export const ConfirmCreate = ({ onConfirm, confirming }) => {
  return (
    <BodyClass isDark={true}>
      <ScrollToTopOnMount />
      <div className='container'>
        <div className='row'>
          <div className='col-xs-12 col-sm-8 col-sm-offset-2'>
            <div className="form-wrapper form-wrapper--inverse form-wrapper--account">
              <div className="form-wrapper--body">
                <h3>
                  You're almost ready!
                </h3>
                <hr />

                <p className='lead'>
                  The last thing we need to do is register your account. This makes encryption information
                  available so that you can share and view cases and diagnoses.
                </p>
                <p className='lead'>
                  Once you complete the sign up, you'll be prompted to register your account.
                </p>
              </div>
              <div className="form-wrapper--footer text-right">
                <LoadingLines visible={confirming} /> &nbsp;
                <button
                  disabled={confirming}
                  className='btn btn-success btn-lg'
                  onClick={onConfirm}>Finish Sign Up</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BodyClass>
  )
}
