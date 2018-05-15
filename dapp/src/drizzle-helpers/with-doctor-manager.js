import { withContextManager } from './with-context-manager'
import get from 'lodash.get'
import getWeb3 from '@/get-web3'

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
