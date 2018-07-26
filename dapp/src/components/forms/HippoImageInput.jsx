import React, { Component } from 'react'
import { ProgressBar } from 'react-bootstrap'
import classNames from 'classnames'

export const HippoImageInput = class _HippoImageInput extends Component {

  cancelUpload = (e) => {
    e.preventDefault()
    this.props.handleCancelUpload(this.props.name)
  }

  handleReset = (e) => {
    e.preventDefault()
    this.props.resetImageState(this.props.name)
  }

  render() {
    const {
      name, id, label, subLabel, error, fileError, onChange,
      currentValue, progressPercent, colClasses, fileUploadActive
    } = this.props

    const progressClassNames = classNames(
      {
        'progress--wrapper__show': fileUploadActive,
        'progress--wrapper__hide': !fileUploadActive
      }
    )

    return (
      <div className="row">
        <div id={id} className={colClasses}>
          <div className={classNames('form-group', 'form-group--file-input', { 'has-error': error || fileError })}>
            <label className='control-label'>
              {label}
              {subLabel ? <span className="text-gray small"><br/>{subLabel}</span> : null}
            </label>
            <div>
              <div className="hidden-input-mask">
                <input />
              </div>
              {
                currentValue ? null : (
                  <label className="btn btn btn-info">
                    Select File ... <input
                      name={name}
                      onClick={(event) => {
                        // reset each time so user can choose the same file if they cancel
                        event.target.value = null
                      }}
                      onChange={onChange}
                      type="file"
                      accept='image/*'
                      className="form-control"
                      style={{ display: 'none' }}
                    />
                  </label>
                )
              }
              <span>
                {currentValue}
              </span>
              {fileUploadActive ? (
                <a onClick={this.cancelUpload} className="btn btn-link btn-md text-gray no-underline">{'\u2716'}</a>
              ) : null}
              {currentValue ? (
                <a onClick={this.handleReset} className="btn btn-link btn-md text-gray no-underline">{'\u2716'}</a>
              ) : null}
              <div className={progressClassNames}>
                <ProgressBar
                  active
                  bsStyle="success"
                  now={progressPercent} />
              </div>
              {error}
              {fileError}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

