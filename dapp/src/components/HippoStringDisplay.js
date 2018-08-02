import React from 'react'
import PropTypes from 'prop-types'

export const HippoStringDisplay = ({ label, value, visibleIf }) => {
  if (!visibleIf) { return null }

  label = label ? <label className="text-gray">{label}</label> : null

  return (
    <React.Fragment>
      {label}
      <p>
        {value}
      </p>
      <br />
    </React.Fragment>
  )
}

HippoStringDisplay.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
  visibleIf: PropTypes.bool.isRequired
}
