import get from 'lodash.get'

export const caseFinders = {
  encryptedCaseKey (state, address) {
    return get(state, `caseLogs[${address}].encryptedCaseKey`)
  },

  caseKeySalt (state, address) {
    return get(state, `caseLogs[${address}].caseKeySalt`)
  },

  caseDataHash (state, address) {
    return get(state, `caseLogs[${address}].caseDataHash`)
  },

  doctorEncryptedCaseKey (state, caseAddress, doctorAddress) {
    return get(state, `caseLogs[${caseAddress}][${doctorAddress}]`)
  }
}
