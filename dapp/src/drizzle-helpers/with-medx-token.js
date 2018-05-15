import { withContextManager } from './with-context-manager'
import get from 'lodash.get'

export const withMedXToken = function (WrappedComponent) {
  return withContextManager(WrappedComponent, function (contextManager) {
    return {
      MedXToken: {
        balanceOf: {
          cacheCall: function (account) {
            return contextManager.context.drizzle.contracts.MedXToken.methods.balanceOf.cacheCall(account)
          },
          value: function (key) {
            return get(contextManager.props, `contracts.MedXToken.balanceOf[${key}].value`)
          }
        },
        mint: {
          cacheSend: function (account, amount) {
            return contextManager.context.drizzle.contracts.MedXToken.methods.mint.cacheSend(account, amount)
          }
        }
      }
    }
  })
}
