import React from 'react'
import PropTypes from 'prop-types'

export const HippoStringDisplay = ({ label, value, visibleIf }) => {
  if (visibleIf === false) { return null }

  label = label ? <label className="text-gray">{label}</label> : null

  return (
    <React.Fragment>
      {label}
      <p dangerouslySetInnerHTML={{__html: value}} />
      <br />
    </React.Fragment>
  )
}

HippoStringDisplay.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
  visibleIf: PropTypes.bool
}
