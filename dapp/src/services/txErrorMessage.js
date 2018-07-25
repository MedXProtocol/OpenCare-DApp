import { transactionErrorToCode } from '~/services/transactionErrorToCode'
import i18next from 'i18next'

export const txErrorMessage = function (error) {
  let message
  const code = transactionErrorToCode(error.message)
  message = 'There was a transaction error'
  if (code) {
    message = i18next.t(`transactionErrors.${code}`)
  }

  return message
}
