import { withContextManager } from './with-context-manager'
import get from 'lodash.get'

export const withAccountManager = function (WrappedComponent) {
  return withContextManager(WrappedComponent, function (contextManager) {
    return {
      AccountManager: {
        publicKeys: {
          cacheCall: function (account) {
            return contextManager.context.drizzle.contracts.AccountManager.methods.publicKeys.cacheCall(account)
          },
          value: function (key) {
            return get(contextManager.props, `contracts.AccountManager.publicKeys[${key}].value`)
          }
        },

        setPublicKey: {
          cacheSend: function (account, key) {
            return contextManager.context.drizzle.contracts.AccountManager.methods.setPublicKey.cacheSend(account, key)
          }
        }
      }
    }
  })
}
