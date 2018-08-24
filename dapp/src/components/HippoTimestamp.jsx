import React from 'react'
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

export const HippoTimestamp = ({ timeInUtcSecondsSinceEpoch, delimiter }) => {
  if (!timeInUtcSecondsSinceEpoch || (timeInUtcSecondsSinceEpoch < 1)) { return null }

  const formattedCreatedAt = formatCreatedAt(timeInUtcSecondsSinceEpoch)

  const entries = `${formattedCreatedAt.date} ${delimiter ? delimiter : `-`} ${formattedCreatedAt.time}`

  return (
    <span className="text-gray" dangerouslySetInnerHTML={{__html: entries}} />
  )
}

