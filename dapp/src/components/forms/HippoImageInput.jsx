import React, { Component } from 'react'
import { ProgressBar } from 'react-bootstrap'
import classnames from 'classnames'

export const HippoImageInput = class _HippoImageInput extends Component {

  constructor(props) {
    super(props)

    this.state = {
      cancelClicked: false
    }
  }

  cancelUpload = (e) => {
    e.preventDefault()
    this.setState({
      cancelClicked: true
    })
    this.props.handleCancelUpload(this.props.name)
  }

  reset = (e) => {
    e.preventDefault()
    this.props.handleResetImageState(this.props.name)
  }

  captureImage = (e) => {
    // e.stopPropagation()
    // e.preventDefault()

    this.setState({
      cancelClicked: false
    })

    this.props.handleCaptureImage(e.target.files[0], this.props.name)
  }

  showProgress = (e) => {
    const percent = this.props.progressPercent

    if (this.state.cancelClicked) {
      return 'cancelling ...'
    } else if (percent < 9) {
      return 'reading file ...'
    } else if (percent > 9 && percent < 25) {
      return 'compressing ...'
    } else if (percent > 25 && percent < 50) {
      return 'encrypting ...'
    } else if (percent > 50 && percent < 90) {
      return 'uploading ...'
    } else if (percent === 90) {
      return 'pinning to ipfs'
    } else if (percent === 100) {
      return 'done !'
    }
  }

  render() {
    const {
      name, id, label, subLabel, error, fileError,
      currentValue, progressPercent, colClasses, fileUploadActive
    } = this.props

    const progressClassNames = classnames(
      {
        'progress--wrapper__show': fileUploadActive,
        'progress--wrapper__hide': !fileUploadActive
      }
    )

    return (
      <div className="row">
        <div id={id} className={colClasses}>
          <div className={classnames('form-group', 'form-group--file-input', { 'has-error': error || fileError })}>
            <label className='control-label' htmlFor={`${id}-input`}>
              {label}
              {subLabel ? <span className="text-gray small"><br/>{subLabel}</span> : null}
            </label>
            <div className="form-group--file-input__input-container">
              {
                this.props.uploadPromise ? null : (
                  <label htmlFor={`${id}-input`} className="btn btn btn-info">
                    Select File ... <input
                      id={`${id}-input`}
                      name={name}
                      onChange={this.captureImage}
                      type="file"
                      accept='image/*'
                      className="form-control"
                      style={{ position: 'absolute', left: '-99999px' }}
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

