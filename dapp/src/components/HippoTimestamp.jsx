import React from 'react'
import PropTypes from 'prop-types'
import { format } from 'date-fns'

function formatCreatedAt(time) {
  const date = new Date(0)
  date.setUTCSeconds(time)

  return {
    timezoneOffset: format(date, 'Z'),
    date: format(date, 'MMM Do, YYYY'),
    time: format(date, 'H:mm:ss')
  }
}

export const HippoTimestamp = ({ timeInUtcSecondsSinceEpoch }) => {
  if (!timeInUtcSecondsSinceEpoch || (timeInUtcSecondsSinceEpoch < 1)) { return null }

  const formattedCreatedAt = formatCreatedAt(timeInUtcSecondsSinceEpoch)

  return (
    <span className="text-gray">
      {formattedCreatedAt.date}
      &nbsp;- {formattedCreatedAt.time}
      &nbsp;<small>({formattedCreatedAt.timezoneOffset})</small>
    </span>
  )
}

HippoTimestamp.propTypes = {
  timeInUtcSecondsSinceEpoch: PropTypes.any.isRequired
}
