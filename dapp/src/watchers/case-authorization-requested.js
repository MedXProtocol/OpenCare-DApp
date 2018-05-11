import { contractFromConfig, getCaseFactoryContract } from '@/utils/web3-util'
import padLeft from '@/utils/pad-left'
import { store } from '@/store'

function bytes32ToAddress(string) {
  return '0x' + string.substring(26)
}

export default async function() {
  const { web3 } = window

  let caseFactory = await getCaseFactoryContract()
  let topicAddress = "0x" + padLeft(caseFactory.address.substring(2), 64)
  var authRequest = web3.sha3('CaseAuthorizationRequested(address,address,address)')
  var authRequestFilter = web3.eth.filter({
    fromBlock: 0,
    toBlock: 'latest',
    topics: [authRequest, topicAddress]
  })

  authRequestFilter.watch((error, result) => {
    store.dispatch({
      type: 'CaseAuthorizationRequested',
      address: result.address,
      patient: bytes32ToAddress(result.topics[2]),
      doctor: bytes32ToAddress(result.topics[3])
    })
  })
}
