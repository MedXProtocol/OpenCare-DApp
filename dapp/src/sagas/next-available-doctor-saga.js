import {
  contractByName,
  web3Call
} from '~/saga-genesis'
import { isBlank } from '~/utils/isBlank'
import {
  select,
  put,
  takeLatest
} from 'redux-saga/effects'
import { fisherYatesShuffle } from '~/services/fisherYatesShuffle'
import range from 'lodash.range'

function* doctorManager() {
  return yield select(state => contractByName(state, 'DoctorManager'))
}

function* accountManager() {
  return yield select(state => contractByName(state, 'AccountManager'))
}

function* nextAvailableDoctor () {
  return yield select((state) => state.nextAvailableDoctor.doctor)
}

// function* isOnline(address) {
//   return yield select((state) => state.heartbeat[address])
// }

function* isExcluded(address) {
  const excludedAddresses = yield select(state => state.nextAvailableDoctor.excludedAddresses)
  return excludedAddresses.indexOf(address) !== -1
}

function* fetchDoctorCredentials(address) {
  let credentials = null
  if (yield isExcluded(address)) { return null }

  const isActive = yield web3Call(yield doctorManager(), 'isActive', address)
  if (!isActive) { return null }

  const publicKey = yield web3Call(yield accountManager(), 'publicKeys', address)
  if (isBlank(publicKey)) { return null }

  credentials = {
    address,
    isActive,
    publicKey
  }
  return credentials
}

function* fetchDoctorByAddress(address) {
  let doctor = null
  const credentials = yield fetchDoctorCredentials(address)
  if (credentials) {
    const DoctorManager = yield doctorManager()
    const index = yield web3Call(DoctorManager, 'doctorIndices', address)
    const name = yield web3Call(DoctorManager, 'doctorNames', index)
    doctor = {
      index, name, ...credentials
    }
  }
  return doctor
}

function* fetchDoctorByIndex(index) {
  let doctor = null

  const DoctorManager = yield doctorManager()
  const address = yield web3Call(DoctorManager, 'doctorAddresses', index)
  const credentials = yield fetchDoctorCredentials(address)

  if (credentials) {
    const name = yield web3Call(DoctorManager, 'doctorNames', index)
    doctor = {
      index, name, ...credentials
    }
  }
  return doctor
}

function* setNextAvailableDoctor() {
  let doctor = yield findNextAvailableOnlineDoctor()
  if (!doctor) {
    doctor = yield findNextAvailableOfflineDoctor()
  }
  if (doctor) {
    yield put({ type: 'NEXT_AVAILABLE_DOCTOR', doctor })
  } else {
    console.warn('No doctors are available')
  }
}

function* findNextAvailableOnlineDoctor () {
  const onlineAddresses = Object.keys(yield select(state => state.heartbeat))
  let doctor = null
  for (var i = 0; i < onlineAddresses.length; i++) {
    doctor = yield fetchDoctorByAddress(onlineAddresses[i])
    if (doctor) { break }
  }
  return doctor
}

function* findNextAvailableOfflineDoctor() {
  const DoctorManager = yield doctorManager()
  const doctorCount = yield web3Call(DoctorManager, 'doctorCount')
  let doctor = null

  // range is non-inclusive on 'end', so if doctorCount is 4 then this will result in [1, 2, 3]
  // start at 1 since Solidity, 0 is '0x0'
  let doctorIndices = range(1, doctorCount)

  while (doctorIndices.length > 0) {
    doctorIndices = fisherYatesShuffle(doctorIndices)
    const randomIndex = doctorIndices[0]

    doctor = yield fetchDoctorByIndex(randomIndex)
    if (doctor) {
      break
    }

    // remove this doctor from the array so we don't choose it again
    doctorIndices.shift()
  }
  return doctor
}

// function* checkDoctorOnline({ address }) {
//   const nextDoctor = yield nextAvailableDoctor()
//   if (!nextDoctor || !(yield isOnline(nextDoctor.address))) {
//     const doctor = yield fetchDoctorByAddress(address)
//     if (doctor) {
//       yield put({ type: 'NEXT_AVAILABLE_DOCTOR', doctor })
//     }
//   }
// }

// function* checkDoctorOffline({ address }) {
//   const nextDoctor = yield nextAvailableDoctor()

//   if (!nextDoctor || nextDoctor.address === address) {
//     yield setNextAvailableDoctor() // find another one
//   }
// }

function* checkNextAvailableDoctor() {
  const nextDoctor = yield nextAvailableDoctor()
  if (!nextDoctor) {
    yield setNextAvailableDoctor()
  }
}

function* forgetAndFindNext() {
  yield put({ type: 'FORGET_NEXT_DOCTOR' })
  yield put({ type: 'CHECK_AVAILABLE_DOCTORS' })
}

export function* nextAvailableDoctorSaga() {
  // yield takeEvery('USER_ONLINE', checkDoctorOnline)
  // yield takeEvery('USER_OFFLINE', checkDoctorOffline)

  yield takeLatest('EXCLUDED_DOCTORS', forgetAndFindNext)

  yield takeLatest('CHECK_AVAILABLE_DOCTORS', checkNextAvailableDoctor)
  yield put({ type: 'CHECK_AVAILABLE_DOCTORS' })
}
