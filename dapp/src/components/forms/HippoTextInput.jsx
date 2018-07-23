import React, { Component } from 'react'
import classNames from 'classnames'

export const HippoTextInput = class _HippoTextInput extends Component {

  handleBlur = () => {
    this.props.onBlur(this.props.name)
  }

  render() {
    const { name, label, error, setRef, onChange, colClasses, type } = this.props

    let required
    if (this.props.required)
      required = <span className='star'>*</span>

    return (
      <div className={colClasses ? 'row' : ''}>
        <div className={colClasses ? colClasses : ''}>
          <div className={classNames('form-group', { 'has-error': error })}>
            <label className="control-label">{label} {required}</label>
            <input
              name={name}
              onChange={onChange}
              onBlur={this.handleBlur}
              type={type ? type : "text"}
              ref={setRef}
              className="form-control" />
            {error}
          </div>
        </div>
      </div>
    )
  }
}

