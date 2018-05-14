import { contractFromConfig, getCaseManagerContract } from '@/utils/web3-util'
import padLeft from '@/utils/pad-left'
import { store } from '@/store'
import getWeb3 from '@/get-web3'

function bytes32ToAddress(string) {
  return '0x' + string.substring(26)
}

export default async function() {
  const web3 = getWeb3()

  let caseManager = await getCaseManagerContract()
  let topicAddress = "0x" + padLeft(caseManager.options.address.substring(2), 64)
  var authRequest = web3.sha3('CaseAuthorizationRequested(address,address,address)')
  var authRequestSubscription = web3.eth.filter({
    fromBlock: 0,
    toBlock: 'latest',
    topics: [authRequest, topicAddress]
  })

  authRequestSubscription.watch((error, result) => {
    store.dispatch({
      type: 'CaseAuthorizationRequested',
      address: result.address,
      patient: bytes32ToAddress(result.topics[2]),
      doctor: bytes32ToAddress(result.topics[3])
    })
  })
}
