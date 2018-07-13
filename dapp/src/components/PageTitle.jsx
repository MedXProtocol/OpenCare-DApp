import React from 'react'
import DocumentTitle from 'react-document-title'
import { I18n } from 'react-i18next'

export function PageTitle({ renderTitle }) {
  return <I18n>{(t) => <DocumentTitle title={renderTitle(t)} />}</I18n>
}
