import React, { Component } from 'react'
import classnames from 'classnames'
import { defined } from '~/utils/defined'
import FlipMove from 'react-flip-move'
import TextareaAutosize from 'react-autosize-textarea'

export const HippoTextArea = class _HippoTextArea extends Component {

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
    this.props.textAreaOnBlur(event, this.props.name)
  }

  handleChange = (event) => {
    event.persist()
    this.props.textAreaOnChange(event, this.props.name)
  }

  render() {
    const { label } = this.props
    const { name, error, colClasses } = this.props
    let controlLabel
    if (this.props.optional) {
      controlLabel = <label className="control-label">
        {label} <span className="text-gray">(Optional)</span>
      </label>
    }

    return (
      <React.Fragment>
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
                  <div className={classnames('form-group', { 'has-error': error })}>
                    {controlLabel}
                    <TextareaAutosize
                      id={name}
                      name={name}
                      onChange={this.handleChange}
                      onBlur={this.handleBlur}
                      className="form-control"
                    />
                    {error}
                  </div>
                </div>
              </div>
            )
          }
        </FlipMove>
      </React.Fragment>
    )
  }
}

