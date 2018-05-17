import { withContextManager } from './with-context-manager'
import createCacheCall from './create-cache-call'

export const withCaseManager = function (WrappedComponent) {
  return withContextManager(WrappedComponent, function (contextManager) {
    return {
      CaseManager: {
        getPatientCaseListCount: createCacheCall(contextManager, 'getPatientCaseListCount'),
        patientCases: createCacheCall(contextManager, 'patientCases')
      }
    }
  })
}
