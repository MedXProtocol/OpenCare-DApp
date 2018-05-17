import get from 'lodash.get'

export default function(contextManager, name) {
  return {
    cacheCall: function () {
      let methods = contextManager.context.drizzle.contracts.CaseManager.methods
      return methods[name].cacheCall.apply(methods, arguments)
    },
    value: function (key) {
      return get(contextManager.props, `contracts.CaseManager.${name}[${key}].value`)
    }
  }
}
