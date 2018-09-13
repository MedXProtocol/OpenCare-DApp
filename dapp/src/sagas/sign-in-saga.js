import { put, takeEvery, call, select } from 'redux-saga/effects'
import { signIn } from '~/services/sign-in'
import secretKeyInvalid from '~/services/secret-key-invalid'
import masterPasswordInvalid from '~/services/master-password-invalid'
import { mixpanel } from '~/mixpanel'
import { Account } from '~/accounts/Account'
import { contractByName, web3Call } from '~/saga-genesis'

// Here the sign in should perform the check
export function* signInSaga({ networkId, secretKey, masterPassword, account, address, overrideAccount }) {
  if (!networkId || !address) {
    yield put({ type: 'SIGN_IN_ERROR', missingCredentialsError: 'Ethereum Address and/or Network ID is missing' })
    return
  }

  var masterPasswordError = masterPasswordInvalid(masterPassword)
  if (masterPasswordError) {
    yield put({ type: 'SIGN_IN_ERROR', masterPasswordError })
    return
  }

  if (secretKey) { // we are signing into an existing account
    var secretKeyError = secretKeyInvalid(secretKey)
    if (secretKeyError) {
      yield put({ type: 'SIGN_IN_ERROR', secretKeyError })
      return
    }

    if (account) { // then the secret key must match the account secret key
      let newAccount = yield call([Account, 'build'], { networkId, address, secretKey, masterPassword })
      if (account.hashedSecretKey === newAccount.hashedSecretKey) {
        try {
          yield call([account, 'unlockAsync'], masterPassword)
          yield put({ type: 'SIGN_IN_OK', account, masterPassword, address })
          mixpanel.track("Signin")
        } catch (error) {
          yield put({ type: 'SIGN_IN_ERROR', masterPasswordError: error.message })
        }
      } else {
        yield put({ type: 'SIGN_IN_ERROR', secretKeyError: 'An account already exists for your address' })
      }
    } else {
      yield put({ type: 'SIGN_UP', address, secretKey, masterPassword, overrideAccount })
    }

  } else if (account) { // Check the existing account
    try {
      yield call([account, 'unlockAsync'], masterPassword)

      const AccountManager = yield select(contractByName, 'AccountManager')
      let existingPublicKey = yield web3Call(AccountManager, 'publicKeys', address)
      let expectedPublicKey = '0x' + account.hexPublicKey()
      if (existingPublicKey && existingPublicKey !== expectedPublicKey) {
        yield put({
          type: 'SIGN_IN_ERROR',
          publicKeyMismatchError: 'This account does not match the account registered on the blockchain. Please sign in using the secret key from the browser you signed up with.'
        })
        yield account.destroy()
        return
      }

      yield put({ type: 'SIGN_IN_OK', account, masterPassword, address })

      mixpanel.track("Signin")
    } catch (error) {
      yield put({ type: 'SIGN_IN_ERROR', masterPasswordError: error.message })
    }
  } else { // error! no existing account
    yield put({ type: 'SIGN_IN_ERROR', secretKeyError: 'You must enter a secret key' })
  }
}

export function* signInOkSaga({ account, masterPassword, address }) {
  signIn(account)
  mixpanel.identify(account.address())
  yield put({ type: 'SIGNED_IN' })
  yield put({ type: 'FIND_NEXT_AVAILABLE_DOCTOR', excludedAddresses: [address] })
  yield put({ type: 'WEB3_SHH_INIT' })
}

export default function* rootSaga() {
  yield takeEvery('SIGN_IN', signInSaga)
  yield takeEvery('SIGN_IN_OK', signInOkSaga)
}
