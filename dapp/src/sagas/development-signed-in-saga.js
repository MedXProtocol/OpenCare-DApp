import { put, fork, spawn, call, takeEvery, select } from 'redux-saga/effects'
import { signedInSecretKey } from '~/services/sign-in'

// Check to see if we're already signedIn and in development,
// if so make sure the account-reducer signedIn is true
export function* developmentSignedInSaga() {
  console.log('here')

  if ((process.env.NODE_ENV === 'development') && signedInSecretKey())
    yield put({ type: 'SIGNED_IN' })
}
