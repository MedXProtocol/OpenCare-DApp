import React, { Component } from 'react'
import { connect } from 'react-redux'
import { isTrue } from '~/utils/isTrue'
import { Modal } from 'react-bootstrap'
import { toastr } from '~/toastr'
import Select from 'react-select'
import * as Animated from 'react-select/lib/animated';
import { customStyles } from '~/config/react-select-custom-styles'
import { withRouter } from 'react-router-dom'
import classNames from 'classnames'
import { isNotEmptyString } from '~/utils/common-util'
import { uploadJson, uploadFile } from '~/utils/storage-util'
import { withContractRegistry, cacheCall, cacheCallValue, withSaga, withSend } from '~/saga-genesis'
import hashToHex from '~/utils/hash-to-hex'
import get from 'lodash.get'
import getWeb3 from '~/get-web3'
import { genKey } from '~/services/gen-key'
import { currentAccount } from '~/services/sign-in'
import { contractByName } from '~/saga-genesis/state-finders'
import { DoctorSelect } from '~/components/DoctorSelect'
import { reencryptCaseKey } from '~/services/reencryptCaseKey'
import { mixpanel } from '~/mixpanel'
import { TransactionStateHandler } from '~/saga-genesis/TransactionStateHandler'
import { Loading } from '~/components/Loading'
import { HippoImageInput } from '~/components/forms/HippoImageInput'
import { HippoToggleButtonGroup } from '~/components/forms/HippoToggleButtonGroup'
import { HippoTextInput } from '~/components/forms/HippoTextInput'
import { countries } from './countries'
import { regions } from './regions'
import { DoctorRandomizer } from '~/components/DoctorRandomizer'

function mapStateToProps (state) {
  const account = get(state, 'sagaGenesis.accounts[0]')
  const MedXToken = contractByName(state, 'MedXToken')
  const CaseManager = contractByName(state, 'CaseManager')
  const balance = cacheCallValue(state, MedXToken, 'balanceOf', account)
  const AccountManager = contractByName(state, 'AccountManager')
  const publicKey = cacheCallValue(state, AccountManager, 'publicKeys', account)

  return {
    AccountManager,
    account,
    transactions: state.sagaGenesis.transactions,
    MedXToken,
    CaseManager,
    publicKey,
    balance
  }
}

function mapDispatchToProps(dispatch) {
  return {
    clearModal: () => {
      dispatch({ type: 'BETA_FAUCET_MODAL_SMISSED' })
    }
  }
}

function* saga({ account, AccountManager, MedXToken }) {
  if (!MedXToken || !account || !AccountManager) { return }
  yield cacheCall(MedXToken, 'balanceOf', account)
  yield cacheCall(AccountManager, 'publicKeys', account)
}

const requiredFields = [
  'firstImageHash',
  'secondImageHash',
  'howLong',
  'size',
  'painful',
  'bleeding',
  'itching',
  'skinCancer',
  'sexuallyActive',
  'color',
  'prevTreatment',
  'age',
  'country',
  'selectedDoctor'
]

export const CreateCase = withContractRegistry(connect(mapStateToProps, mapDispatchToProps)(withSaga(saga, { propTriggers: ['account', 'MedXToken', 'AccountManager'] })(withSend(class _CreateCase extends Component {
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
        region: null,
        color: null,
        prevTreatment: null,
        description: null,
        caseEncryptionKey: genKey(32),
        showBalanceTooLowModal: false,
        showConfirmSubmissionModal: false,
        showPublicKeyModal: false,
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
      this.setRegionRef = element => { this.regionInput = element }
    }

    componentDidMount () {
      this.props.clearModal()
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

    checkCountry = () => {
      if (this.state.country === 'US') {
        requiredFields.push('region')
      } else {
        let index = requiredFields.indexOf('region')
        if (index > -1)
          requiredFields.splice(index, 1)

        this.setState({ region: '' })
        this.regionInput.select.clearValue()
      }
    }

    runValidation = async () => {
      // reset error states
      await this.setState({ errors: [] })

      let errors = []
      let length = requiredFields.length

      for (var fieldIndex = 0; fieldIndex < length; fieldIndex++) {
        let fieldName = requiredFields[fieldIndex]
        if (!isNotEmptyString(this.state[fieldName]))
          errors.push(fieldName)
      }

      await this.setState({ errors: errors })

      // Go to first error field
      if (errors.length > 0) {
        window.location.hash = `#${errors[0]}`;
        // this[`${errors[0]}Input`].focus() // this only works on text fields
      }

    }

    handleSubmit = async (event) => {
      event.preventDefault()

      await this.runValidation()

      if (!this.props.balance)
        console.error("The props.balance wasn't set!")

      if (this.state.errors.length === 0) {
        if (this.props.balance < 15) {
          this.setState({ showBalanceTooLowModal: true })
        } else {
          this.setState({ showConfirmSubmissionModal: true })
        }
      }
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

    onChangeDoctor = (option) => {
      this.setState({
        selectedDoctor: option
      }, this.validateInputs)
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
            region: this.state.region,
            color: this.state.color,
            prevTreatment: this.state.prevTreatment,
            description: this.state.description
        }

        const caseJson = JSON.stringify(caseInformation)
        const hash = await uploadJson(caseJson, this.state.caseEncryptionKey)
        const account = currentAccount()
        const caseKeySalt = genKey(32)
        const encryptedCaseKey = account.encrypt(this.state.caseEncryptionKey, caseKeySalt)

        const doctorPublicKey = this.state.selectedDoctor.publicKey.substring(2)
        const doctorEncryptedCaseKey = reencryptCaseKey({account, encryptedCaseKey, doctorPublicKey, caseKeySalt})

        const { send, MedXToken, CaseManager } = this.props
        let hashHex = hashToHex(hash)

        let CaseManagerContract = this.props.contractRegistry.get(CaseManager, 'CaseManager', getWeb3())

        let data = null
        if (!this.props.publicKey) {
          data = CaseManagerContract.methods.createAndAssignCaseWithPublicKey(
            this.props.account,
            '0x' + encryptedCaseKey,
            '0x' + caseKeySalt,
            '0x' + hashHex,
            this.state.selectedDoctor.value,
            '0x' + doctorEncryptedCaseKey,
            '0x' + account.hexPublicKey()
          ).encodeABI()
        } else {
          data = CaseManagerContract.methods.createAndAssignCase(
            this.props.account,
            '0x' + encryptedCaseKey,
            '0x' + caseKeySalt,
            '0x' + hashHex,
            this.state.selectedDoctor.value,
            '0x' + doctorEncryptedCaseKey
          ).encodeABI()
        }

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

    errorMessage(fieldName) {
      let msg
      if (fieldName === 'country' || fieldName === 'region') {
        msg = 'must be chosen'
      } else if (fieldName.match(/ImageHash/g)) {
        msg = 'please upload an image and wait for it to complete uploading'
      } else {
        msg = 'must be filled out'
      }
      return msg
    }

    render() {
      let errors = {}
      for (var i = 0; i < this.state.errors.length; i++) {
        let fieldName = this.state.errors[i]

        errors[fieldName] =
          <p key={`errors-${i}`} className='has-error help-block small'>
            {this.errorMessage(fieldName)}
          </p>
      }

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
                      <HippoImageInput
                        name='firstImage'
                        id='firstImageHash'
                        label="Overview Photo:"
                        colClasses='col-xs-12 col-sm-12 col-md-6'
                        error={errors['firstImageHash']}
                        fileError={firstFileError}
                        setRef={this.setFirstImageHashRef}
                        onChange={this.captureFirstImage}
                        currentValue={this.state.firstFileName}
                        progressClassNames={this.progressClassNames(this.state.firstImagePercent)}
                        progressPercent={this.state.firstImagePercent}
                      />

                      <HippoImageInput
                        name='secondImage'
                        id='secondImageHash'
                        label="Close-up Photo:"
                        colClasses='col-xs-12 col-sm-12 col-md-6'
                        error={errors['secondImageHash']}
                        fileError={secondFileError}
                        setRef={this.setSecondImageHashRef}
                        onChange={this.captureSecondImage}
                        currentValue={this.state.secondFileName}
                        progressClassNames={this.progressClassNames(this.state.secondImagePercent)}
                        progressPercent={this.state.secondImagePercent}
                      />

                      <div className="form-group--heading">
                        Details:
                      </div>

                      <HippoToggleButtonGroup
                        id='howLong'
                        name="howLong"
                        colClasses='col-xs-12 col-md-6'
                        label='How long have you had this problem?'
                        error={errors['howLong']}
                        setRef={this.setHowLongRef}
                        onChange={this.updateHowLong}
                        values={['Days', 'Weeks', 'Months', 'Years']}
                      />

                      <HippoToggleButtonGroup
                        id='size'
                        name="size"
                        colClasses='col-xs-12 col-md-6'
                        label='Is it growing, shrinking or staying the same size?'
                        error={errors['size']}
                        setRef={this.setSizeRef}
                        onChange={this.updateSize}
                        values={['Growing', 'Shrinking', 'Same size']}
                      />

                      <HippoToggleButtonGroup
                        id='painful'
                        name="painful"
                        colClasses='col-xs-12 col-md-6'
                        label='Is it painful?'
                        error={errors['painful']}
                        setRef={this.setPainfulRef}
                        onChange={this.updatePainful}
                        values={['Yes', 'No']}
                      />

                      <HippoToggleButtonGroup
                        id='bleeding'
                        name="bleeding"
                        colClasses='col-xs-12 col-md-6'
                        label='Is it bleeding?'
                        error={errors['bleeding']}
                        setRef={this.setBleedingRef}
                        onChange={this.updateBleeding}
                        values={['Yes', 'No']}
                      />

                      <HippoToggleButtonGroup
                        id='itching'
                        name="itching"
                        colClasses='col-xs-12 col-md-6'
                        label='Is it itching?'
                        error={errors['itching']}
                        setRef={this.setItchingRef}
                        onChange={this.updateItching}
                        values={['Yes', 'No']}
                      />

                      <HippoToggleButtonGroup
                        id='skinCancer'
                        name="skinCancer"
                        colClasses='col-xs-12 col-md-6'
                        label='Any history of skin cancer?'
                        error={errors['skinCancer']}
                        setRef={this.setSkinCancerRef}
                        onChange={this.updateSkinCancer}
                        values={['Yes', 'No']}
                      />

                      <HippoToggleButtonGroup
                        id='sexuallyActive'
                        name="sexuallyActive"
                        colClasses='col-xs-12 col-md-6'
                        label='Are you sexually active?'
                        error={errors['sexuallyActive']}
                        setRef={this.setSexuallyActiveRef}
                        onChange={this.updateSexuallyActive}
                        values={['Yes', 'No']}
                      />

                      <HippoTextInput
                        id='color'
                        name="color"
                        colClasses='col-xs-12 col-sm-12 col-md-6'
                        label='Has it changed in color?'
                        error={errors['color']}
                        setRef={this.setColorRef}
                        onChange={(event) => this.setState({ color: event.target.value })}
                      />

                      <HippoTextInput
                        id='prevTreatment'
                        name="prevTreatment"
                        colClasses='col-xs-12 col-sm-12 col-md-6'
                        label='Have you tried any treatments so far?'
                        error={errors['prevTreatment']}
                        setRef={this.setPrevTreatmentRef}
                        onChange={(event) => this.setState({ prevTreatment: event.target.value })}
                      />


                      <div className="form-group--heading">
                        Additional Info:
                      </div>

                      <div className="row">
                        <div className="col-xs-6 col-sm-3 col-md-1">
                          <HippoTextInput
                            type='number'
                            id='age'
                            name='age'
                            label='Age'
                            error={errors['age']}
                            setRef={this.setAgeRef}
                            onChange={(event) => this.setState({ age: event.target.value })}
                          />
                        </div>
                        <div className="col-xs-12 col-sm-6 col-md-3">
                          <div className={classNames('form-group', { 'has-error': errors['country'] })}>
                            <label>Country</label>
                            <Select
                              placeholder='Please select your Country'
                              styles={customStyles}
                              components={Animated}
                              closeMenuOnSelect={true}
                              ref={this.setCountryRef}
                              options={countries}
                              onChange={(newValue) => this.setState({ country: newValue.value }, this.checkCountry)}
                              selected={this.state.country}
                              required
                            />
                            {errors['country']}
                          </div>
                        </div>
                        <div className="col-xs-8 col-sm-3 col-md-2">
                          <div className={classNames('form-group', { 'has-error': errors['region'] })}>
                            <label>State</label>
                            <Select
                              isDisabled={this.state.country !== 'US'}
                              placeholder='Please select your State'
                              styles={customStyles}
                              components={Animated}
                              closeMenuOnSelect={true}
                              ref={this.setRegionRef}
                              options={regions}
                              onChange={(newValue) => {
                                this.setState({ region: newValue ? newValue.value : '' })
                              }}
                              selected={this.state.region}
                            />
                            {errors['region']}
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                          <div className="form-group">
                            <label>Please include any additional info below <span className="text-gray">(Optional)</span></label>
                            <textarea
                              onChange={(event) => this.setState({ description: event.target.value })}
                              className="form-control"
                              rows="5" />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-8 col-lg-6">
                          <div className={classNames("form-group", { 'has-error': !!errors['selectedDoctor'] })}>
                            {isTrue(process.env.REACT_APP_FEATURE_MANUAL_DOCTOR_SELECT)
                              ?
                              <div>
                                <label>Select a Doctor<span className='star'>*</span></label>
                                  <DoctorSelect
                                    excludeAddresses={[this.props.account]}
                                    value={this.state.selectedDoctor}
                                    isClearable={false}
                                    onChange={this.onChangeDoctor} />
                              </div>
                              :
                              <DoctorRandomizer
                                excludeAddresses={[this.props.account]}
                                value={this.state.selectedDoctor}
                                onChange={this.onChangeDoctor} />
                             }

                            {errors['selectedDoctor']}
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-8 col-lg-6 text-right">
                          <button type="submit" className="btn btn-lg btn-success">Submit Case</button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Modal show={this.state.showPublicKeyModal}>
            <Modal.Body>
              <div className="row">
                <div className="col-xs-12 text-center">
                  <h4>
                    Your account has not yet been set up.
                  </h4>
                  <p>
                    You must wait until your account has been saved to the blockchain. Click the <span className="text-blue">blue</span> button labeled <strong><span className="text-blue">Register Account</span></strong>.
                  </p>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button
                onClick={() => { this.setState({ showPublicKeyModal: false }) }}
                type="button"
                className="btn btn-danger"
              >Ok</button>
            </Modal.Footer>
          </Modal>

          <Modal show={this.state.showBalanceTooLowModal}>
            <Modal.Body>
              <div className="row">
                <div className="col-xs-12 text-center">
                  <h4>You need 15 MEDX to submit a case.</h4>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button
                onClick={this.handleCloseBalanceTooLowModal}
                type="button"
                className="btn btn-primary"
              >Close</button>
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
