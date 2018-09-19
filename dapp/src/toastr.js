import React from 'react'
import { Link } from 'react-router-dom'
import { toastr as toastrLib } from 'react-redux-toastr'
import { txErrorMessage } from '~/services/txErrorMessage'

const ToastrLinkComponent = ({ link, remove }) => {
  if (!link.path) {
    throw new Error('link.path was not passed to a toastr msg')
  } else if (!link.text) {
    throw new Error('link.text was not passed to a toastr msg')
  }

  return <Link to={link.path}>{link.text}</Link>
}

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

function warning(message, link) {
  const options = { icon: 'warning', status: 'warning' }
  options['component'] = link ? <ToastrLinkComponent link={link} /> : null

  toastrLib.light('Warning', message, options)
}

function transactionError(exception) {
  error(txErrorMessage(exception))
}

export const toastr = {
  success,
  error,
  warning,
  transactionError
}
