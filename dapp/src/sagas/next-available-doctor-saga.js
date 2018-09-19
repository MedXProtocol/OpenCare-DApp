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

const debug = require('debug')('next-available-doctor-saga')

function* doctorManager() {
  return yield select(state => contractByName(state, 'DoctorManager'))
}

function* accountManager() {
  return yield select(state => contractByName(state, 'AccountManager'))
}

function* thisAccount () {
  return yield select((state) => state.sagaGenesis.accounts[0])
}

function* isExcluded(doctorAddress) {
  let excludedAddresses = yield select(state => state.nextAvailableDoctor.excludedAddresses)
  let thisAccountAddress = yield thisAccount()

  excludedAddresses = [
    ...excludedAddresses.map(address => address.toLowerCase()),
    thisAccountAddress.toLowerCase()
  ]

  return excludedAddresses.includes(doctorAddress.toLowerCase())
}

function* fetchDoctorCredentials(address) {
  debug(`fetchDoctorCredentials(${address})`)

  let credentials = null

  if (yield isExcluded(address)) { return null }

  const isActive = yield web3Call(yield doctorManager(), 'isActive', address)
  if (!isActive) { return null }

  const isDermatologist = yield web3Call(yield doctorManager(), 'isDermatologist', address)
  if (!isDermatologist) { return null }

  const publicKey = yield web3Call(yield accountManager(), 'publicKeys', address)
  if (isBlank(publicKey)) { return null }

  const patientAddress = yield select(state => state.sagaGenesis.accounts[0])
  if (patientAddress === undefined) { return null }

  const patientIsDoctor = yield web3Call(yield doctorManager(), 'isDoctor', patientAddress)
  const regionMatches = yield isRegionMatch(address)

  if (!patientIsDoctor && !regionMatches) {
    return null
  }

  debug(`fetchDoctorCredentials(${address}): MATCH patientIsDoctor: ${patientIsDoctor}, regionMatches: ${regionMatches}`)

  credentials = {
    address,
    isActive,
    isDermatologist,
    publicKey
  }
  return credentials
}

// When the patient is in Canada and the same province then it's ok, but if other
// province then it's not okay. Same goes for USA
function* isRegionMatch(address) {
  const patientCountry = yield select(state => state.nextAvailableDoctor.patientCountry)
  const patientRegion = yield select(state => state.nextAvailableDoctor.patientRegion)
  const doctorCountry = yield web3Call(yield doctorManager(), 'country', address)
  const doctorRegion = yield web3Call(yield doctorManager(), 'region', address)

  debug(`isRegionMatch(${address}): ${doctorCountry}, ${doctorRegion} patient: ${patientCountry}, ${patientRegion}`)

  const requiresRegionMatch = patientCountry === 'US' || patientCountry === 'CA'

  return (
    requiresRegionMatch &&
    patientCountry === doctorCountry &&
    patientRegion === doctorRegion
  )
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
  debug(`fetchDoctorByIndex(${index})`)
  let doctor = null

  const DoctorManager = yield doctorManager()
  const address = yield web3Call(DoctorManager, 'doctorAddresses', index)
  const credentials = yield fetchDoctorCredentials(address)

  if (credentials) {
    const name = yield web3Call(DoctorManager, 'doctorNames', index)
    debug(`fetchDoctorByIndex(${index}): found ${name}`)
    doctor = {
      index, name, ...credentials
    }
  }
  return doctor
}

function* findNextAvailableDoctor() {
  debug('findNextAvailableDoctor')
  let doctor = yield findNextAvailableOnlineDoctor()
  if (!doctor) {
    doctor = yield priorityDoctorOrOfflineDoctor()
  }
  if (doctor) {
    debug(`findNextAvailableDoctor: found: ${doctor.address}`)
    yield put({ type: 'NEXT_AVAILABLE_DOCTOR', doctor })
  } else {
    debug(`findNextAvailableDoctor: NO DOCTOR`)
    yield put({ type: 'NO_DOCTORS_AVAILABLE' })
  }
}

function* priorityDoctorOrOfflineDoctor() {
  debug('priorityDoctorOrOfflineDoctor')
  let doctor = yield findNextPriorityDoctor()
  if (!doctor) {
    doctor = yield findNextAvailableOfflineDoctor()
  }

  return doctor
}

function* findNextAvailableOnlineDoctor () {
  debug('findNextAvailableOnlineDoctor')
  let onlineAddresses = Object.keys(yield select(state => state.heartbeat.users))
  let doctor = null
  onlineAddresses = shuffle(onlineAddresses)
  for (var i = 0; i < onlineAddresses.length; i++) {
    doctor = yield fetchDoctorByAddress(onlineAddresses[i])
    if (doctor) {
      debug(`findNextAvailableOnlineDoctor: fetchDoctorByAddress: ${doctor.address}`)
      break
    }
  }
  return doctor
}

function* findNextPriorityDoctor() {
  debug('findNextPriorityDoctor')
  let doctor = null
  let addresses = []
  if (process.env.REACT_APP_COMMA_SEPARATED_PRIORITY_DOCTOR_ADDRESSES) {
    addresses = process.env.REACT_APP_COMMA_SEPARATED_PRIORITY_DOCTOR_ADDRESSES
      .split(',')
      .filter((val) => val)
  }
  addresses = shuffle(addresses)

  for (var i = 0; i < addresses.length; i++) {
    doctor = yield fetchDoctorByAddress(addresses[i])

    if (doctor) {
      debug(`findNextPriorityDoctor: found: ${doctor.address}`)
      break
    }
  }

  return doctor
}

function* findNextAvailableOfflineDoctor() {
  debug('findNextAvailableOfflineDoctor')
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
      debug(`findNextAvailableOfflineDoctor: found: ${doctor.address}`)
      break
    }

    // remove this doctor from the array so we don't choose them again
    doctorIndices.shift()
  }
  return doctor
}

function* checkDoctorAvailable() {
  const doctor = yield select(state => state.nextAvailableDoctor.doctor)
  if (!doctor) {
    yield put({ type: 'FIND_NEXT_AVAILABLE_DOCTOR' })
  }
}

export function* nextAvailableDoctorSaga() {
  yield takeLatest('FIND_NEXT_AVAILABLE_DOCTOR', findNextAvailableDoctor)
  yield takeLatest('EXCLUDED_DOCTORS', checkDoctorAvailable)
  yield takeLatest('PATIENT_INFO', checkDoctorAvailable)
}
