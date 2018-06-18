import { toastr as toastrLib } from 'react-redux-toastr'
import { transactionErrorToCode } from '~/services/transaction-error-to-code'
import i18next from 'i18next'

function success(message) {
  toastrLib.light('Success', message, { icon: 'success', status: 'success' })
}

function error(message) {
  toastrLib.light('Error', message, { icon: 'error', status: 'error' })
}

function transactionError(transactionError) {
  const code = transactionErrorToCode(transactionError)
  let message = 'There was a transaction error'
  if (code) {
    message = i18next.t(`transactionErrors.${code}`)
  }
  error(message)
}

export const toastr = {
  success,
  error,
  transactionError
}
