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
import shuffle from 'lodash.shuffle'
import range from 'lodash.range'

function* doctorManager() {
  return yield select(state => contractByName(state, 'DoctorManager'))
}

function* accountManager() {
  return yield select(state => contractByName(state, 'AccountManager'))
}

function* thisAccount () {
  return yield select((state) => state.sagaGenesis.accounts[0])
}

function* isExcluded(address) {
  let excludedAddresses = yield select(state => state.nextAvailableDoctor.excludedAddresses)

  excludedAddresses = [...excludedAddresses, yield thisAccount()]

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

function* findNextAvailableDoctor() {
  let doctor = yield findNextAvailableOnlineDoctor()
  if (!doctor) {
    doctor = yield findNextAvailableOfflineDoctor()
  }
  if (doctor) {
    yield put({ type: 'NEXT_AVAILABLE_DOCTOR', doctor })
  } else {
    yield put({ type: 'NO_DOCTORS_AVAILABLE' })
    // console.warn('No doctors are available')
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
    doctorIndices = shuffle(doctorIndices)
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

function* checkExcludedDoctors() {
  const doctor = yield select(state => state.nextAvailableDoctor.doctor)
  if (!doctor) {
    yield put({ type: 'FIND_NEXT_AVAILABLE_DOCTOR' })
  }
}

export function* nextAvailableDoctorSaga() {
  yield takeLatest('FIND_NEXT_AVAILABLE_DOCTOR', findNextAvailableDoctor)
  yield takeLatest('EXCLUDED_DOCTORS', checkExcludedDoctors)
}
