import {
  cacheCall,
  cacheCallValue
} from '~/saga-genesis'

function mapStateToCaseFee(state) {
  return {
    caseFeeUsd: cacheCallValue('CaseManager', 'caseFeeUsd'),
    caseFeeWei: cacheCallValue('CaseManager', 'caseFeeWei'),
  }
}

function* caseFeeSaga() {
  yield cacheCall('CaseManager', 'caseFeeUsd')
  yield cacheCall('CaseManager', 'caseFeeWei')
}
