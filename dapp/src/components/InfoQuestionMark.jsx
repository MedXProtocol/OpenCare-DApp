import React, { Component } from 'react'
import ReactTooltip from 'react-tooltip'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faQuestionCircle from '@fortawesome/fontawesome-free-solid/faQuestionCircle';
import PropTypes from 'prop-types'

export const InfoQuestionMark = class _InfoQuestionMark extends Component {
  render () {
    return (
      <span className='info-question-mark' data-tip={this.props.tooltipText}>
        <FontAwesomeIcon
          icon={faQuestionCircle}
        />
        <ReactTooltip
          html={true}
          effect='solid'
          place={this.props.place || 'bottom'}
          wrapper='span'
        />
      </span>
    )
  }
}

InfoQuestionMark.propTypes = {
  tooltipText: PropTypes.string
}
