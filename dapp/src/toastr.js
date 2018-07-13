import React from 'react'
import { toastr as toastrLib } from 'react-redux-toastr'
import { transactionErrorToCode } from '~/services/transaction-error-to-code'
import i18next from 'i18next'

const ToastrLinkComponent = ({link, remove}) => (
  <a href={link.path}>{link.text}</a>
)

function success(message, link = {}) {
  const options = { icon: 'success', status: 'success' }
  options['component'] = link ? <ToastrLinkComponent link={link} /> : null

  toastrLib.light('Success', message, options)
}

function error(message, link = {}) {
  const options = { icon: 'error', status: 'error' }
  options['component'] = link ? <ToastrLinkComponent link={link} /> : null

  toastrLib.light('Error', message, options)
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
