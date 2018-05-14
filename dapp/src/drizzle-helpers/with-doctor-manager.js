import { withContextManager } from './with-context-manager'
import get from 'lodash.get'

export const withDoctorManager = function (WrappedComponent) {
  return withContextManager(WrappedComponent, function (contextManager) {
    return {
      DoctorManager: {
        isDoctor: {
          cacheCall: function (account) {
            return contextManager.context.drizzle.contracts.DoctorManager.methods.isDoctor.cacheCall(account)
          },
          value: function (key) {
            return get(contextManager.props, `contracts.DoctorManager.isDoctor[${key}].value`)
          }
        }
      }
    }
  })
}
