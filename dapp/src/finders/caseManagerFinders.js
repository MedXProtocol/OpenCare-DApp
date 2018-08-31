import get from 'lodash.get'

export const caseManagerFinders = {
  caseFromBlock (state, caseAddress) {
    if (caseAddress) {
      caseAddress = caseAddress.toLowerCase()
    }
    return get(state, `caseManagerLogs[${caseAddress}].fromBlock`)
  }
}
