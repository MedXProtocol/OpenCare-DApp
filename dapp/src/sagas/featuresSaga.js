import {
  put,
  select
} from 'redux-saga/effects'

// See https://stackoverflow.com/questions/11214404/how-to-detect-if-browser-supports-html5-local-storage

function* checkLocalStorage () {
  var mod = 'abcdefg_featureCheck' + Date.now()
  var enabled
  try {
    window.localStorage.setItem(mod, mod)
    window.localStorage.removeItem(mod)
    enabled = true
  } catch (e) {
    enabled = false
  }
  const wasEnabled = yield select(state => state.features.localStorage)
  if (wasEnabled !== enabled) {
    yield put({ type: 'SET_FEATURE', feature: 'localStorage', enabled })
  }
}

export function* featuresSaga() {
  yield checkLocalStorage()
}
