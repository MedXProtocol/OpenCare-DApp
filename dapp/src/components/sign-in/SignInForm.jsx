import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Alert, HelpBlock } from 'react-bootstrap'
import { formatSecretKey } from '~/services/format-secret-key'
import { connect } from 'react-redux'
import { LoadingLines } from '~/components/LoadingLines'
import { OverrideDisallowedModal } from '~/components/OverrideDisallowedModal'
import { cacheCallValue, contractByName } from '~/saga-genesis/state-finders'
import { cacheCall } from '~/saga-genesis/sagas'
import { withSaga } from '~/saga-genesis/components'
import get from 'lodash.get'

const HIDDEN_KEY = formatSecretKey(Array(65).join('X'))

function mapStateToProps(state, ownProps) {
  const account = get(state, 'sagaGenesis.accounts[0]')
  const isSignedIn = get(state, 'account.signedIn')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const signingIn = get(state, 'account.signingIn')

  if (isSignedIn)
    var isDoctor = cacheCallValue(state, DoctorManager, 'isDoctor', account)

  return {
    signingIn,
    isSignedIn,
    isDoctor,
    overrideError: state.account.overrideError,
    secretKeyError: state.account.secretKeyError,
    masterPasswordError: state.account.masterPasswordError
  }
}

function mapDispatchToProps(dispatch) {
  return {
    clearOverrideError: () => {
      dispatch({ type: 'SIGN_IN_RESET_OVERRIDE' })
    }
  }
}

function* saga({ account, DoctorManager }) {
  if (!account || !DoctorManager) { return }
  yield cacheCall(DoctorManager, 'isDoctor', account)
}

export const SignInForm = class extends Component {
  constructor (props) {
    super(props)
    this.state = {
      secretKey: '',
      masterPassword: '',
      showOverrideModal: false
    }
  }

  onChangeSecretKey = (e) => {
    this.setState({secretKey: formatSecretKey(e.target.value)})
  }

  onSubmit = (e) => {
    if (e) e.preventDefault()
    this.doSubmit()
  }

  doSubmit = (overrideAccount) => {
    var strippedSecretKey = this.state.secretKey.replace(/[^\w]/g, '')
    this.props.onSubmit({
      secretKey: strippedSecretKey,
      masterPassword: this.state.masterPassword,
      overrideAccount
    })
  }

  render () {
    const { signingIn } = this.props
    var masterPasswordError
    if (this.props.masterPasswordError) {
      masterPasswordError = <Alert bsStyle='danger'>{this.props.masterPasswordError}</Alert>
    }

    var secretKeyError
    if (this.props.secretKeyError) {
      secretKeyError = <Alert bsStyle='danger'>{this.props.secretKeyError}</Alert>
    }

    if (this.props.hasAccount) {
      var existingSecretKey =
        <HelpBlock>Leave blank to use your secret key on file</HelpBlock>
    }

    return (
      <div className="form-wrapper form-wrapper--inverse form-wrapper--account">
        <form onSubmit={this.onSubmit} autoComplete='off'>
          <div className="form-wrapper--body">
            <OverrideDisallowedModal
              show={!!this.props.overrideError}
              onOk={this.props.clearOverrideError} />
            <div className='form-group'>
              <label htmlFor="secretKey">Secret Key</label>
              <input
                value={this.state.secretKey}
                autoComplete="off"
                onChange={this.onChangeSecretKey}
                placeholder={HIDDEN_KEY}
                type="text"
                className="form-control input-lg"
                name='secret-key'
                minLength='79'
                maxLength='79' />
              {existingSecretKey}
              {secretKeyError}
            </div>
            <div className='form-group'>
              <label htmlFor="masterPassword">Master Password</label>
              <input
                value={this.state.masterPassword}
                onChange={(e) => this.setState({ masterPassword: e.target.value })}
                type="password"
                className="form-control input-lg"
                autoFocus={true} />
              {masterPasswordError}
            </div>
            {this.props.children}
          </div>
          <div className="form-wrapper--footer">
            <div className='text-right'>
              <LoadingLines visible={signingIn} /> &nbsp;
              <input
                disabled={signingIn}
                type='submit'
                value={signingIn ? 'Signing In ...' : 'Sign In'}
                className='btn btn-lg btn-primary' />
            </div>
          </div>
        </form>
      </div>
    )
  }
}

export const SignInFormContainer = connect(mapStateToProps, mapDispatchToProps)(withSaga(saga, { propTriggers: ['signedIn', 'account', 'DoctorManager'] })(SignInForm))

SignInFormContainer.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  hasAccount: PropTypes.bool,
  masterPasswordError: PropTypes.string,
  secretKeyError: PropTypes.string
}
