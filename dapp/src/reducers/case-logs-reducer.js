import caseContractConfig from '#/Case.json'
import { ABIHelper } from '~/utils/ABIHelper'

const caseAbi = new ABIHelper(caseContractConfig.abi)
const CASE_CREATED = caseAbi.topic0('CaseCreated')
const DOCTOR_ENCRYPTED_CASE_KEY_SET = caseAbi.topic0('DoctorEncryptedCaseKeySet')
const DIAGNOSIS_HASH = caseAbi.topic0('DiagnosisHash')
const CHALLENGE_HASH = caseAbi.topic0('ChallengeHash')

function applyLog(state, log) {
  let params, caseAddress
  switch(log.topics[0]) {
    case CASE_CREATED:
      params = caseAbi.decodeLogParameters(log)
      caseAddress = log.address
      state[caseAddress] = {
        caseDataHash: params.caseDataHash,
        encryptedCaseKey: params.encryptedCaseKey,
        caseKeySalt: params.caseKeySalt
      }
      break

    case DOCTOR_ENCRYPTED_CASE_KEY_SET:
      params = caseAbi.decodeLogParameters(log)
      caseAddress = log.address
      state[caseAddress] = {
        ...state[caseAddress],
        [params.doctor.toLowerCase()]: params.doctorEncryptedCaseKey
      }
      break

    case DIAGNOSIS_HASH:
      params = caseAbi.decodeLogParameters(log)
      caseAddress = log.address
      state[caseAddress] = {
        ...state[caseAddress],
        diagnosisHash: params.diagnosisHash
      }
      break

    case CHALLENGE_HASH:
      params = caseAbi.decodeLogParameters(log)
      caseAddress = log.address
      state[caseAddress] = {
        ...state[caseAddress],
        challengeHash: params.challengeHash
      }
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