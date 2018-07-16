import React from 'react'
import { Link } from 'react-router-dom'
import { toastr as toastrLib } from 'react-redux-toastr'
import { transactionErrorToCode } from '~/services/transaction-error-to-code'
import i18next from 'i18next'

const ToastrLinkComponent = ({ link, remove }) => (
  if (!link.path) {
    throw new Error('link.path was not passed to a toastr msg')
  } else if (!link.text) {
    throw new Error('link.text was not passed to a toastr msg')
  }
  return <Link to={link.path}>{link.text}</Link>
)

function success(message, link) {
  const options = { icon: 'success', status: 'success' }
  options['component'] = link ? <ToastrLinkComponent link={link} /> : null

  toastrLib.light('Success', message, options)
}

function error(message, link) {
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
