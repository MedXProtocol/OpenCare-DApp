import caseContractConfig from '#/Case.json'
import { ABIHelper } from '~/utils/ABIHelper'

const caseAbi = new ABIHelper(caseContractConfig.abi)
const CASE_CREATED = caseAbi.topic0('CaseCreated')
const DOCTOR_ENCRYPTED_CASE_KEY_SET = caseAbi.topic0('DoctorEncryptedCaseKeySet')

function applyLog(state, log) {
  let params
  switch(log.topics[0]) {
    case CASE_CREATED:
      params = caseAbi.decodeLogParameters(log)

      state[log.address] = params
      break

    case DOCTOR_ENCRYPTED_CASE_KEY_SET:
      params = caseAbi.decodeLogParameters(log)

      state[log.address][params.doctor] = params.doctorEncryptedCaseKey
      break

    //no default
  }
}

export default function(state, { type, logs, log }) {
  if (typeof state === 'undefined') {
    state = {}
  }

  switch(type) {
    case 'PAST_LOGS':
      state = {...state}
      logs.forEach((log) => {
        applyLog(state, log)
      })
      break

    case 'NEW_LOG':
      state = {...state}
      applyLog(state, log)
      break

    //no default
  }

  return state
}
