import get from 'lodash.get'
import { fixAddress } from '~/utils/fixAddress'

export const caseFinders = {
  encryptedCaseKey (state, address) {
    return get(state, `caseLogs[${fixAddress(address)}].encryptedCaseKey`)
  },

  caseKeySalt (state, address) {
    return get(state, `caseLogs[${fixAddress(address)}].caseKeySalt`)
  },

  caseDataHash (state, address) {
    return get(state, `caseLogs[${fixAddress(address)}].caseDataHash`)
  },

  diagnosisHash (state, address) {
    return get(state, `caseLogs[${fixAddress(address)}].diagnosisHash`)
  },

  challengeHash (state, address) {
    return get(state, `caseLogs[${fixAddress(address)}].challengeHash`)
  },

  doctorEncryptedCaseKey (state, caseAddress, doctorAddress) {
    return get(state, `caseLogs[${fixAddress(caseAddress)}][${doctorAddress.toLowerCase()}]`)
  }
}
