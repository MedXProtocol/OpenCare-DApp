import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  ControlLabel,
  Modal,
  ProgressBar,
  ToggleButtonGroup,
  ToggleButton,
  ButtonToolbar
} from 'react-bootstrap'
import { toastr } from '~/toastr'
import { genKey } from '~/services/gen-key'
import { withRouter } from 'react-router-dom'
import classNames from 'classnames'
import { isNotEmptyString } from '~/utils/common-util'
import { uploadJson, uploadFile } from '~/utils/storage-util'
import { currentAccount } from '~/services/sign-in'
import { withContractRegistry, cacheCall, cacheCallValue, withSaga, withSend } from '~/saga-genesis'
import hashToHex from '~/utils/hash-to-hex'
import get from 'lodash.get'
import getWeb3 from '~/get-web3'
import { contractByName } from '~/saga-genesis/state-finders'
import { mixpanel } from '~/mixpanel'
import { TransactionStateHandler } from '~/saga-genesis/TransactionStateHandler'
import { Loading } from '~/components/Loading'

function mapStateToProps (state) {
  const account = get(state, 'sagaGenesis.accounts[0]')
  const MedXToken = contractByName(state, 'MedXToken')
  const CaseManager = contractByName(state, 'CaseManager')
  const balance = cacheCallValue(state, MedXToken, 'balanceOf', account)
  return {
    account,
    transactions: state.sagaGenesis.transactions,
    MedXToken,
    CaseManager,
    balance
  }
}

function* saga({ account, MedXToken }) {
  if (!MedXToken) { return }
  yield cacheCall(MedXToken, 'balanceOf', account)
}

export const CreateCase = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['account', 'MedXToken'] })(withSend(class _CreateCase extends Component {
    constructor(){
      super()

      this.state = {
        firstImageHash: null,
        firstFileName: null,
        firstImagePercent: 0,
        secondImageHash: null,
        secondFileName: null,
        secondImagePercent: 0,
        howLong: null,
        size: null,
        painful: null,
        bleeding: null,
        itching: null,
        skinCancer: null,
        sexuallyActive: null,
        age: null,
        country: null,
        color: null,
        prevTreatment: null,
        description: null,
        caseEncryptionKey: genKey(32),
        showBalanceTooLowModal: false,
        showConfirmSubmissionModal: false,
        isSubmitting: false,
        errors: []
      }

      // We need to update to React 0.16.3 to get this nice syntax instead:
      // this.ageInput = React.createRef();

      this.setFirstImageHashRef = element => { this.firstImageHashInput = element }
      this.setSecondImageHashRef = element => { this.secondImageHashInput = element }
      this.setHowLongRef = element => { this.howLongInput = element }
      this.setSizeRef = element => { this.sizeInput = element }
      this.setPainfulRef = element => { this.painfulInput = element }
      this.setBleedingRef = element => { this.bleedingInput = element }
      this.setItchingRef = element => { this.itchingInput = element }
      this.setSkinCancerRef = element => { this.skinCancerInput = element }
      this.setSexuallyActiveRef = element => { this.sexuallyActiveInput = element }
      this.setColorRef = element => { this.colorInput = element }
      this.setPrevTreatmentRef = element => { this.prevTreatmentInput = element }
      this.setAgeRef = element => { this.ageInput = element }
      this.setCountryRef = element => { this.countryInput = element }
    }

    componentWillReceiveProps (props) {
      if (this.state.createCaseEvents) {
        this.state.createCaseEvents.handle(props.transactions[this.state.transactionId])
          .onError((error) => {
            toastr.transactionError(error)
            this.setState({
              createCaseEvents: null,
              transactionId: '',
              showConfirmSubmissionModal: true,
              isSubmitting: false
            })
          })
          .onTxHash(() => {
            toastr.success('Your case has been submitted.')
            mixpanel.track('Case Submitted')
            this.props.history.push('/patients/cases')
          })
      }
    }

    fileTooLarge (size) {
      return size > 10485760 // 10 megabytes
    }

    captureFirstImage = async (event) => {
      this.setState({firstFileError: null})
      if (event.target.files[0] && this.fileTooLarge(event.target.files[0].size)) {
        this.setState({
          firstFileError: 'The file must be smaller than 10MB'
        })
        return
      }

      const fileName = event.target.files[0].name
      const progressHandler = (percent) => {
        this.setState({ firstImagePercent: percent })
      }
      // Clear out previous values
      this.setState({
        firstImageHash: null,
        firstFileName: null
      })

      const imageHash = await this.captureFile(event, progressHandler)
      this.setState({
        firstImageHash: imageHash,
        firstFileName: fileName
      })
    }

    captureSecondImage = async (event) => {
      this.setState({secondFileError: null})
      if (event.target.files[0] && this.fileTooLarge(event.target.files[0].size)) {
        this.setState({
          secondFileError: 'The file must be smaller than 10MB'
        })
        return
      }

      const fileName = event.target.files[0].name
      const progressHandler = (percent) => {
        this.setState({ secondImagePercent: percent })
      }
      // Clear out previous values
      this.setState({
        secondImageHash: null,
        secondFileName: null
      })

      const imageHash = await this.captureFile(event, progressHandler)
      this.setState({
        secondImageHash: imageHash,
        secondFileName: fileName
      })
    }

    captureFile = async (event, progressHandler) => {
      event.stopPropagation()
      event.preventDefault()
      const file = event.target.files[0]
      const imageHash = await uploadFile(file, this.state.caseEncryptionKey, progressHandler)

      return imageHash
    }

    updateHowLong = (event) => {
      this.setState({ howLong: event.target.value })
    }

    updateSize = (event) => {
      this.setState({ size: event.target.value })
    }

    updatePainful = (event) => {
      this.setState({ painful: event.target.value })
    }

    updateItching = (event) => {
      this.setState({ itching: event.target.value })
    }

    updateBleeding = (event) => {

      this.setState({ bleeding: event.target.value })
    }

    updateSkinCancer = (event) => {
      this.setState({ skinCancer: event.target.value })
    }

    updateSexuallyActive = (event) => {
      this.setState({ sexuallyActive: event.target.value })
    }

    runValidation = async () => {
      // reset error states
      await this.setState({ errors: [] })

      let errors = []
      let requiredFields = this.requiredFields()
      let length = requiredFields.length

      for (var fieldIndex = 0; fieldIndex < length; fieldIndex++) {
        let fieldName = requiredFields[fieldIndex]
        if (!isNotEmptyString(this.state[fieldName]))
          errors.push(fieldName)
      }

      await this.setState({ errors: errors })
    }

    handleSubmit = async (event) => {
      event.preventDefault()

      await this.runValidation()

      if (this.state.errors.length === 0) {
        if (this.props.balance < 15) {
          this.setState({ showBalanceTooLowModal: true })
        } else {
          this.setState({ showConfirmSubmissionModal: true })
        }
      }
    }

    requiredFields = () => {
      return [
        'firstImageHash',
        'secondImageHash',
        'howLong',
        'size',
        'painful',
        'bleeding',
        'itching',
        'skinCancer',
        'sexuallyActive',
        'age',
        'country',
        'color',
        'prevTreatment'
      ]
    }

    handleCloseBalanceTooLowModal = (event) => {
      event.preventDefault()
      this.setState({ showBalanceTooLowModal: false })
    }

    handleCancelConfirmSubmissionModal = (event) => {
      event.preventDefault()
      this.setState({ showConfirmSubmissionModal: false })
    }

    handleAcceptConfirmSubmissionModal = async (event) => {
      event.preventDefault()

      this.setState({
        showConfirmSubmissionModal: false,
        isSubmitting: true
      })

      await this.createNewCase()
    }

    createNewCase = async () => {
        const caseInformation = {
            firstImageHash: this.state.firstImageHash,
            secondImageHash: this.state.secondImageHash,
            howLong: this.state.howLong,
            size: this.state.size,
            painful: this.state.painful,
            bleeding: this.state.bleeding,
            itching: this.state.itching,
            skinCancer: this.state.skinCancer,
            sexuallyActive: this.state.sexuallyActive,
            age: this.state.age,
            country: this.state.country,
            color: this.state.color,
            prevTreatment: this.state.prevTreatment,
            description: this.state.description
        }

        const caseJson = JSON.stringify(caseInformation)
        const hash = await uploadJson(caseJson, this.state.caseEncryptionKey)
        const account = currentAccount()
        const caseKeySalt = genKey(32)
        const encryptedCaseKey = account.encrypt(this.state.caseEncryptionKey, caseKeySalt)

        const { send, MedXToken, CaseManager } = this.props
        let hashHex = hashToHex(hash)

        let CaseManagerContract = this.props.contractRegistry.get(this.props.CaseManager, 'CaseManager', getWeb3())
        let data = CaseManagerContract.methods.createCase(
          this.props.account,
          '0x' + encryptedCaseKey,
          '0x' + caseKeySalt,
          '0x' + hashHex
        ).encodeABI()
        let transactionId = send(MedXToken, 'approveAndCall', CaseManager, 15, data)()
        this.setState({
          transactionId,
          createCaseEvents: new TransactionStateHandler()
        })
    }

    progressClassNames = (percent) => {
      return classNames(
        {
          'progress--wrapper__show': percent > 0 && percent < 100,
          'progress--wrapper__hide': percent === 0 || percent === 100
        }
      )
    }

    render() {
      let errors = {}
      for (var i = 0; i < this.state.errors.length; i++) {
        let fieldName = this.state.errors[i]
        errors[fieldName] =
          <p key={`errors-${i}`} className='has-error help-block small'>
            must be filled out
          </p>
      }

      // Highlight first error field
      let firstField = this.requiredFields().find(field => {
        if (errors.hasOwnProperty(field))
          return field
        else
          return undefined
      })
      // if (firstField) {
      //   // window.location.hash = "#" + firstField;
      //   this[`${firstField}Input`].focus()
      // }

      if (this.state.firstFileError) {
        var firstFileError = <p className='has-error help-block'>{this.state.firstFileError}</p>
      }

      if (this.state.secondFileError) {
        var secondFileError = <p className='has-error help-block'>{this.state.secondFileError}</p>
      }

      return (
        <div>
          <div className="row">
            <div className="col-xs-12">
              <div className="card">
                <div className="card-header">
                  <div className="row">
                    <div className="col-xs-12 col-md-6">
                      <h3 className="title">
                        Submit New Case
                      </h3>
                      <p className="lead">
                        <small>Provide the physician with details about your problem. This will be encrypted so only you and your physician will be able to read it.</small>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="form-wrapper">
                    <form onSubmit={this.handleSubmit}>
                      <div className="form-group--heading">
                        Imagery:
                      </div>
                      <div className="row">
                        <div id="firstImageHash" className="col-xs-12 col-sm-12 col-md-6">
                          <div className={classNames('form-group', { 'has-error': errors['firstImageHash'] || firstFileError })}>
                            <label className='control-label'>Overview Photo<span className='star'>*</span></label>
                            <div>
                              <div style={{ height: '0', width: '0', overflow: 'hidden' }}>
                                <input ref={this.setFirstImageHashRef} style={{ opacity: '0', pointerEvents: 'none' }} />
                              </div>
                              <label className="btn btn btn-info">
                                Select File ... <input
                                            name="firstImage"
                                            onChange={this.captureFirstImage}
                                            type="file"
                                            accept='image/*'
                                            className="form-control"
                                            style={{ display: 'none' }} />
                              </label>
                              <span>
                                &nbsp; {this.state.firstFileName}
                              </span>
                              <div className={this.progressClassNames(this.state.firstImagePercent)}>
                                <ProgressBar
                                  active
                                  bsStyle="success"
                                  now={this.state.firstImagePercent} />
                              </div>
                              {errors['firstImageHash']}
                              {firstFileError}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div id="secondImageHash" className="col-xs-12 col-sm-12 col-md-6">
                          <div className={classNames('form-group', { 'has-error': errors['secondImageHash'] || secondFileError })}>
                            <label>Close-up Photo<span className='star'>*</span></label>
                            <div>
                              <div style={{ height: '0', width: '0', overflow: 'hidden' }}>
                                <input ref={this.setSecondImageHashRef} style={{ opacity: '0', pointerEvents: 'none' }} />
                              </div>
                              <label className="btn btn btn-info">
                                  Select File ... <input
                                              name="secondImage"
                                              onChange={this.captureSecondImage}
                                              type="file"
                                              accept='image/*'
                                              className="form-control"
                                              style={{ display: 'none' }} />
                              </label>
                              <span>
                                  &nbsp; {this.state.secondFileName}
                              </span>
                              <div className={this.progressClassNames(this.state.secondImagePercent)}>
                                <ProgressBar
                                  active
                                  bsStyle="success"
                                  now={this.state.secondImagePercent} />
                              </div>
                              {errors['secondImageHash']}
                              {secondFileError}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="form-group--heading">
                        Details:
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-md-6">
                          <div className={classNames('form-group', { 'has-error': errors['howLong'] })}>
                            <ControlLabel>How long have you had this problem?<span className='star'>*</span></ControlLabel>
                            <div style={{ height: '0', width: '0', overflow: 'hidden' }}>
                              <input ref={this.setHowLongRef} style={{ opacity: '0', pointerEvents: 'none' }} />
                            </div>
                            <ButtonToolbar>
                              <ToggleButtonGroup name="howLong" type="radio">
                                <ToggleButton
                                  onChange={this.updateHowLong}
                                  value='Days'>
                                  Days
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updateHowLong}
                                  value='Weeks'>
                                  Weeks
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updateHowLong}
                                  value='Months'>
                                  Months
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updateHowLong}
                                  value='Years'>
                                  Years
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </ButtonToolbar>
                            {errors['howLong']}
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-xs-12 col-md-6">
                          <div className={classNames('form-group', { 'has-error': errors['size'] })}>
                            <ControlLabel>Is it growing, shrinking or staying the same size?<span className='star'>*</span></ControlLabel>
                            <div style={{ height: '0', width: '0', overflow: 'hidden' }}>
                              <input ref={this.setSizeRef} style={{ opacity: '0', pointerEvents: 'none' }} />
                            </div>
                            <ButtonToolbar>
                              <ToggleButtonGroup name="size" type="radio">
                                <ToggleButton
                                  onChange={this.updateSize}
                                  value='Growing'>
                                  Growing
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updateSize}
                                  value='Shrinking'>
                                  Shrinking
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updateSize}
                                  value='Same size'>
                                  Same size
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </ButtonToolbar>
                            {errors['size']}
                          </div>
                        </div>
                      </div>


                      <div className="row">
                        <div className="col-xs-12 col-md-6">
                          <div className={classNames('form-group', { 'has-error': errors['painful'] })}>
                            <ControlLabel>Is it painful?<span className='star'>*</span></ControlLabel>
                            <div style={{ height: '0', width: '0', overflow: 'hidden' }}>
                              <input ref={this.setPainfulRef} style={{ opacity: '0', pointerEvents: 'none' }} />
                            </div>
                            <ButtonToolbar>
                              <ToggleButtonGroup name="painful" type="radio">
                                <ToggleButton
                                  onChange={this.updatePainful}
                                  value='Yes'>
                                  Yes
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updatePainful}
                                  value='No'>
                                  No
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </ButtonToolbar>
                            {errors['painful']}
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-md-6">
                          <div className={classNames('form-group', { 'has-error': errors['bleeding'] })}>
                            <ControlLabel>Is it bleeding?<span className='star'>*</span></ControlLabel>

                            <div style={{ height: '0', width: '0', overflow: 'hidden' }}>
                              <input ref={this.setBleedingRef} style={{ opacity: '0', pointerEvents: 'none' }} />
                            </div>
                            <ButtonToolbar>
                              <ToggleButtonGroup name="bleeding" type="radio">
                                <ToggleButton
                                  onChange={this.updateBleeding}
                                  value='Yes'>
                                  Yes
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updateBleeding}
                                  value='No'>
                                  No
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </ButtonToolbar>
                            {errors['bleeding']}

                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-md-6">
                          <div className={classNames('form-group', { 'has-error': errors['itching'] })}>
                            <ControlLabel>Is it itching?<span className='star'>*</span></ControlLabel>
                            <div style={{ height: '0', width: '0', overflow: 'hidden' }}>
                              <input ref={this.setItchingRef} style={{ opacity: '0', pointerEvents: 'none' }} />
                            </div>

                            <ButtonToolbar>
                              <ToggleButtonGroup name="itching" type="radio">
                                <ToggleButton
                                  onChange={this.updateItching}
                                  value='Yes'>
                                  Yes
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updateItching}
                                  value='No'>
                                  No
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </ButtonToolbar>
                            {errors['itching']}

                          </div>
                        </div>
                      </div>


                      <div className="row">
                        <div className="col-xs-12 col-md-6">
                          <div className={classNames('form-group', { 'has-error': errors['skinCancer'] })}>
                            <ControlLabel>Any history of skin cancer?<span className='star'>*</span></ControlLabel>
                            <div style={{ height: '0', width: '0', overflow: 'hidden' }}>
                              <input ref={this.setSkinCancerRef} style={{ opacity: '0', pointerEvents: 'none' }} />
                            </div>

                            <ButtonToolbar>
                              <ToggleButtonGroup name="skinCancer" type="radio">
                                <ToggleButton
                                  onChange={this.updateSkinCancer}
                                  value='Yes'>
                                  Yes
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updateSkinCancer}
                                  value='No'>
                                  No
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </ButtonToolbar>
                            {errors['skinCancer']}

                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-md-6">
                          <div className={classNames('form-group', { 'has-error': errors['sexuallyActive'] })}>
                            <ControlLabel>Are you sexually active?<span className='star'>*</span></ControlLabel>
                            <div style={{ height: '0', width: '0', overflow: 'hidden' }}>
                              <input ref={this.setSexuallyActiveRef} style={{ opacity: '0', pointerEvents: 'none' }} />
                            </div>

                            <ButtonToolbar>
                              <ToggleButtonGroup name="sexuallyActive" type="radio">
                                <ToggleButton
                                  onChange={this.updateSexuallyActive}
                                  value='Yes'>
                                  Yes
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updateSexuallyActive}
                                  value='No'>
                                  No
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </ButtonToolbar>
                            {errors['sexuallyActive']}

                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-6">
                          <div className={classNames('form-group', { 'has-error': errors['color'] })}>
                            <label>Has it changed in color?<span className='star'>*</span></label>
                            <input
                              onChange={(event) => this.setState({ color: event.target.value })}
                              type="text"
                              ref={this.setColorRef}
                              className="form-control" />
                            {errors['color']}
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-6">
                          <div className={classNames('form-group', { 'has-error': errors['prevTreatment'] })}>
                            <label>Have you tried any treatments so far?<span className='star'>*</span></label>
                            <input
                              onChange={(event) => this.setState({ prevTreatment: event.target.value })}
                              type="text"
                              ref={this.setPrevTreatmentRef}
                              className="form-control" />
                            {errors['prevTreatment']}
                          </div>
                        </div>
                      </div>

                      <div className="form-group--heading">
                        Additional Info:
                      </div>
                      <div className="row">
                        <div className="col-xs-5 col-sm-4 col-md-2">
                          <div className={classNames('form-group', { 'has-error': errors['age'] })}>
                            <label>Age<span className='star'>*</span></label>
                            <input
                              ref={this.setAgeRef}
                              onChange={(event) => this.setState({ age: event.target.value })}
                              type="text"
                              className="form-control" />
                            {errors['age']}
                          </div>
                        </div>
                        <div className="col-xs-12 col-sm-8 col-md-4">
                          <div className={classNames('form-group', { 'has-error': errors['country'] })}>
                            <label>Country<span className='star'>*</span></label>
                            <input
                              type="text"
                              onChange={(event) => this.setState({ country: event.target.value })}
                              ref={this.setCountryRef}
                              className="form-control" />
                            {errors['country']}
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-8 col-lg-6">
                          <div className="form-group">
                            <label>Please include any additional comments below</label>
                            <textarea
                              onChange={(event) => this.setState({ description: event.target.value })}
                              className="form-control"
                              rows="5" />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-8 col-lg-6 text-right">
                          <button
                            type="submit"
                            className="btn btn-lg btn-success">
                            Submit Case
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

        <Modal show={this.state.showBalanceTooLowModal}>
          <Modal.Body>
            <div className="row">
              <div className="col-xs-12 text-center">
                <h4>You need 15 MEDX to submit a case.</h4>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button onClick={this.handleCloseBalanceTooLowModal} type="button" className="btn btn-primary">Close</button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.showConfirmSubmissionModal}>
          <Modal.Body>
            <div className="row">
              <div className="col-xs-12 text-center">
                <h4>
                  Are you sure?
                </h4>
                <h5>
                  This will cost you between 5 - 15 MEDX.
                  <br /><span className="text-gray">(depending on if you require a second opinion or not)</span>
                </h5>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button onClick={this.handleCancelConfirmSubmissionModal} type="button" className="btn btn-link">No</button>
            <button
              disabled={this.state.isSubmitting}
              onClick={this.handleAcceptConfirmSubmissionModal}
              type="button"
              className="btn btn-primary">
              Yes
            </button>
          </Modal.Footer>
        </Modal>

        <Loading loading={this.state.isSubmitting} />
      </div>
    )
  }
}))))

export const CreateCaseContainer = withRouter(CreateCase)
