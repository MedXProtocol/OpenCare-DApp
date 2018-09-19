import { transactionErrorToCode } from '~/services/transactionErrorToCode'
import i18next from 'i18next'

export const txErrorMessage = function (error) {
  let message
  let errorMessage = error

  // we actually want the error msg string, so if that exists use it instead:
  if (error.message) {
    errorMessage = error.message
  }

  const code = transactionErrorToCode(errorMessage)
  message = 'There was a transaction error.'
  if (code) {
    message = i18next.t(`transactionErrors.${code}`)
  }

  return message
}
