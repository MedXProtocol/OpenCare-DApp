import {
  contractByName,
  web3Call
} from '~/saga-genesis'
import { isBlank } from '~/utils/isBlank'
import {
  select,
  put,
  throttle,
  takeEvery
} from 'redux-saga/effects'

function* doctorManager() {
  return yield select(state => contractByName(state, 'DoctorManager'))
}

function* accountManager() {
  return yield select(state => contractByName(state, 'AccountManager'))
}

function* nextAvailableDoctor () {
  return yield select((state) => state.nextAvailableDoctor.doctor)
}

function* isOnline(address) {
  return yield select((state) => state.heartbeat[address])
}

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
  // console.log('fetchDoctorByAddress ', address)
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

  // console.log('fetchDoctorByIndex ', index)
  const DoctorManager = yield doctorManager()
  const address = yield web3Call(DoctorManager, 'doctorAddresses', index)
  // console.log('address: ', address)
  const credentials = yield fetchDoctorCredentials(address)
  // console.log('fetchDoctorByIndex2')

  if (credentials) {
    const name = yield web3Call(DoctorManager, 'doctorNames', index)
    doctor = {
      index, name, ...credentials
    }
  }
  return doctor
}

function* setNextAvailableDoctor() {
  // console.log('setNextAvailableDoctor')

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
  // console.log('findNextAvailableOnlineDoctor')
  for (var i = 0; i < onlineAddresses.length; i++) {
    doctor = yield fetchDoctorByAddress(onlineAddresses[i])
    if (doctor) { break }
  }
  return doctor
}

function* findNextAvailableOfflineDoctor() {
  const DoctorManager = yield doctorManager()
  const doctorCount = yield web3Call(DoctorManager, 'doctorCount')
  let retries = 0
  let doctor = null
  // console.log('findNextAvailableOfflineDoctor')
  while (retries < doctorCount) { //not exactly right because it may repeat doctor indices
    // debugger
    const doctorIndex = parseInt(Math.random() * (doctorCount - 1), 10) + 1
    // debugger
    doctor = yield fetchDoctorByIndex(doctorIndex)
    // debugger
    if (doctor) {
      break
    }
    // debugger
    retries++
  }
  return doctor
}

function* checkDoctorOnline({ address }) {
  const nextDoctor = yield nextAvailableDoctor()
  if (!nextDoctor || !(yield isOnline(nextDoctor.address))) {
    const doctor = yield fetchDoctorByAddress(address)
    if (doctor) {
      yield put({ type: 'NEXT_AVAILABLE_DOCTOR', doctor })
    }
  }
}

function* checkDoctorOffline({ address }) {
  const nextDoctor = yield nextAvailableDoctor()
  if (!nextDoctor || nextDoctor.address === address) {
    yield setNextAvailableDoctor() // find another one
  }
}

function* checkExcludedDoctors({ addresses }) {
  const nextDoctor = yield nextAvailableDoctor()
  console.log('checkExcludedDoctors')
  if (!nextDoctor || addresses.indexOf(nextDoctor.address) !== -1) {
    // console.log('set next available doctor')
    yield setNextAvailableDoctor() // find another one
  }
}

function* checkNextAvailableDoctor() {
  const nextDoctor = yield nextAvailableDoctor()
  // console.log('checkNextAvailableDoctor')
  if (!nextDoctor) {
    yield setNextAvailableDoctor()
  }
}

export function* nextAvailableDoctorSaga() {
  yield takeEvery('USER_ONLINE', checkDoctorOnline)
  yield takeEvery('USER_OFFLINE', checkDoctorOffline)
  yield throttle(1000, 'EXCLUDED_DOCTORS', checkExcludedDoctors)
  yield throttle(500, 'CHECK_AVAILABLE_DOCTORS', checkNextAvailableDoctor)
  yield put({ type: 'AVAILABLE_DOCTOR_INITIALIZED' })
  yield put({ type: 'CHECK_AVAILABLE_DOCTORS' })
}
