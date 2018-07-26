import React, { Component } from 'react'
import { ProgressBar } from 'react-bootstrap'
import classNames from 'classnames'

export const HippoImageInput = class _HippoImageInput extends Component {

  cancelUpload = (e) => {
    e.preventDefault()
    this.props.handleCancelUpload(this.props.name)
  }

  reset = (e) => {
    e.preventDefault()
    this.props.handleResetImageState(this.props.name)
  }

  captureImage = (e) => {
    e.stopPropagation()
    e.preventDefault()

    this.props.handleCaptureImage(e.target.files[0], this.props.name)
  }

  showProgress = (e) => {
    const percent = this.props.progressPercent
    if (percent < 34) {
      return 'reading file ...'
    } else if (percent > 34 && percent < 67) {
      return 'encrypting ...'
    } else if (percent >= 67 && percent < 89) {
      return 'uploading ...'
    } else if (percent >= 89 && percent < 99) {
      return 'pinning to ipfs'
    } else if (percent >= 99) {
      return 'done !'
    }
  }

  render() {
    const {
      name, id, label, subLabel, error, fileError,
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
                      onChange={this.captureImage}
                      type="file"
                      accept='image/*'
                      className="form-control"
                      style={{ display: 'none' }}
                    />
                  </label>
                )
              }

              <span className="form-group--file-input__filename">
                {fileUploadActive ?
                  <React.Fragment>&nbsp; &nbsp;{this.showProgress()}</React.Fragment>
                : currentValue}
              </span>

              {fileUploadActive ? (
                <a onClick={this.cancelUpload} className="btn btn-link btn-md text-gray no-underline">{'\u2716'}</a>
              ) : null}

              {currentValue ? (
                <a onClick={this.reset} className="btn btn-link btn-md text-gray no-underline">{'\u2716'}</a>
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

