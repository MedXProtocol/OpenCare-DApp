import caseManagerContractConfig from '#/CaseManager.json'
import {
  ABIHelper,
  logReducerFactory
} from '~/saga-genesis'

const caseManagerAbi = new ABIHelper(caseManagerContractConfig.abi)
const NEW_CASE = caseManagerAbi.topic0('NewCase')

function applyLog(state, log) {
  let params, caseAddress
  switch(log.topics[0]) {
    case NEW_CASE:
      params = caseManagerAbi.decodeLogParameters(log)
      caseAddress = params.caseAddress.toLowerCase()
      state[caseAddress] = {
        fromBlock: log.blockNumber
      }
      break

    //no default
  }

  return state
}

export default logReducerFactory(applyLog)
