import React, { Component } from 'react'
import classNames from 'classnames'
import { defined } from '~/utils/defined'
import FlipMove from 'react-flip-move'

export const HippoTextInput = class _HippoTextInput extends Component {

  constructor(props) {
    super(props)

    this.state = {
      visible: true
    }
  }

  componentWillReceiveProps(nextProps) {
    if (defined(nextProps.visible) && nextProps.visible !== this.state.visible) {
      this.setState({ visible: nextProps.visible })
    }
  }

  handleBlur = (event) => {
    event.persist()
    this.props.textInputOnBlur(event, this.props.name)
  }

  handleChange = (event) => {
    event.persist()
    this.props.textInputOnChange(event, this.props.name)
  }

  render() {
    const { name, label, error, colClasses, type } = this.props

    return (
      <div style={{ position: 'relative' }}>
        <FlipMove
          enterAnimation="accordionVertical"
          leaveAnimation="accordionVertical"
          maintainContainerHeight={true}
        >
          {!this.state.visible ?
            <span key={`key-${name}-hidden`}>
            </span>
          : (
              <div className={colClasses ? 'row' : ''}>
                <div className={colClasses ? colClasses : ''}>
                  <div className={classNames('form-group', { 'has-error': error })}>
                    <label className="control-label">{label}</label>
                    <input
                      id={name}
                      name={name}
                      onChange={this.handleChange}
                      onBlur={this.handleBlur}
                      type={type ? type : "text"}
                      className="form-control" />
                    {error}
                  </div>
                </div>
              </div>
            )
          }
        </FlipMove>
      </div>
    )
  }
}

