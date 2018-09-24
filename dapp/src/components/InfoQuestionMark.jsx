import React, { Component } from 'react'
import ReactTooltip from 'react-tooltip'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faQuestionCircle from '@fortawesome/fontawesome-free-solid/faQuestionCircle';
import PropTypes from 'prop-types'

export const InfoQuestionMark = class _InfoQuestionMark extends Component {
  render () {
    let char = <FontAwesomeIcon
      icon={faQuestionCircle}
    />

    if (this.props.character) {
      char = this.props.character
    }

    return (
      <span
        className='info-question-mark'
        data-tip={this.props.tooltipText}
        data-for={`info-question-mark-${this.props.name}`}
      >
        {char}
        <ReactTooltip
          id={`info-question-mark-${this.props.name}`}
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
  name: PropTypes.string.isRequired,
  tooltipText: PropTypes.string
}
