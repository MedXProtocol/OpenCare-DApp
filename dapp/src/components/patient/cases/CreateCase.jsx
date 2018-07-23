import React, { Component } from 'react'
import { connect } from 'react-redux'
import { isTrue } from '~/utils/isTrue'
import { Button, Modal } from 'react-bootstrap'
import { toastr } from '~/toastr'
import Select from 'react-select'
import ReactTooltip from 'react-tooltip'
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
import { YourInfo } from './YourInfo'
import { countries } from './countries'
import { regions } from './regions'
import { weiToMedX } from '~/utils/weiToMedX'
import { medXToWei } from '~/utils/medXToWei'
import { AvailableDoctorSelect } from '~/components/AvailableDoctorSelect'
import pull from 'lodash.pull'

function mapStateToProps (state) {
  let medXBeingSent
  const account = get(state, 'sagaGenesis.accounts[0]')
  const MedXToken = contractByName(state, 'MedXToken')
  const CaseManager = contractByName(state, 'CaseManager')
  const balance = cacheCallValue(state, MedXToken, 'balanceOf', account)
  const AccountManager = contractByName(state, 'AccountManager')
  const publicKey = cacheCallValue(state, AccountManager, 'publicKeys', account)
  const caseListCount = cacheCallValue(state, CaseManager, 'getPatientCaseListCount', account)
  const previousCase = (caseListCount > 0)

  const externalTransactions = get(state, 'externalTransactions.transactions')
  for (let i = 0; i < externalTransactions.length; i++) {
    const { inFlight, txType } = externalTransactions[i]
    if (txType === 'sendMedX' && inFlight) {
      medXBeingSent = true
    }
  }

  return {
    AccountManager,
    account,
    transactions: state.sagaGenesis.transactions,
    MedXToken,
    CaseManager,
    publicKey,
    balance,
    previousCase,
    medXBeingSent
  }
}

function mapDispatchToProps(dispatch) {
  return {
    showBetaFaucetModal: () => {
      dispatch({ type: 'SHOW_BETA_FAUCET_MODAL' })
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
  'gender',
  'allergies',
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
// These fields are dynamically added as required depending on choices the user makes:
// 'pregnant'
// 'whatAllergies'
// 'region'

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
        gender: null,
        allergies: null,
        pregnant: null,
        whatAllergies: null,
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
        showTermsModal: false,
        isSubmitting: false,
        errors: []
      }

      // We need to update to React 0.16.3 to get this nice syntax instead:
      // this.ageInput = React.createRef();

      // this.setFirstImageHashRef = element => { this.firstImageHashInput = element }
      // this.setSecondImageHashRef = element => { this.secondImageHashInput = element }
      // this.setHowLongRef = element => { this.howLongInput = element }
      // this.setSizeRef = element => { this.sizeInput = element }
      // this.setPainfulRef = element => { this.painfulInput = element }
      // this.setBleedingRef = element => { this.bleedingInput = element }
      // this.setItchingRef = element => { this.itchingInput = element }
      // this.setSkinCancerRef = element => { this.skinCancerInput = element }
      // this.setSexuallyActiveRef = element => { this.sexuallyActiveInput = element }
      // this.setColorRef = element => { this.colorInput = element }
      // this.setPrevTreatmentRef = element => { this.prevTreatmentInput = element }
      // this.setAgeRef = element => { this.ageInput = element }
      this.setCountryRef = element => { this.countryInput = element }
      this.setRegionRef = element => { this.regionInput = element }
    }

    handleSetRef = (element) => {
      this[`${element.id}Input`] = element
    }

    // handleButtonGroupOnChange = (event, fieldName) => {
    //   this.setState({ [fieldName]: event.target.value }, () => {
    //     this.validateField(fieldName)
    //   })
    // }

    handleButtonGroupOnChange = (event) => {
      this.setState({ [event.target.name]: event.target.value }, () => {
        this.validateField(event.target.name)
      })
    }

    handleTextInputOnChange = (event) => {
      this.setState({ [event.target.id]: event.target.value })
    }

    handleTextInputOnBlur = (event) => {
      this.validateField(event.target.id)
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

    validateFile (file) {
      let error = null
      if (file && this.fileTooLarge(file.size)) {
        error = 'The file must be smaller than 10MB'
      }
      return error
    }

    captureFirstImage = async (event) => {
      const file = event.target.files[0]
      if (!file) { return }
      this.setState({firstFileError: null})
      const error = this.validateFile(file)
      if (error) {
        this.setState({ firstFileError: error })
        return
      }

      const fileName = file.name
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

      this.validateField('firstImageHash')
    }

    captureSecondImage = async (event) => {
      const file = event.target.files[0]
      if (!file) { return }
      this.setState({secondFileError: null})
      const error = this.validateFile(file)
      if (error) {
        this.setState({ secondFileError: error })
        return
      }

      const fileName = file.name
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

      this.validateField('secondImageHash')
    }

    captureFile = async (event, progressHandler) => {
      event.stopPropagation()
      event.preventDefault()
      const file = event.target.files[0]
      const imageHash = await uploadFile(file, this.state.caseEncryptionKey, progressHandler)

      return imageHash
    }

    // updateHowLong = (event) => {
    //   this.setState({ howLong: event.target.value }, () => {
    //     this.validateField('howLong')
    //   })
    // }

    // updateSize = (event) => {
    //   this.setState({ size: event.target.value }, () => {
    //     this.validateField('size')
    //   })
    // }

    // updatePainful = (event) => {
    //   this.setState({ painful: event.target.value }, () => {
    //     this.validateField('painful')
    //   })
    // }

    // updateItching = (event) => {
    //   this.setState({ itching: event.target.value }, () => {
    //     this.validateField('itching')
    //   })
    // }

    // updateBleeding = (event) => {
    //   this.setState({ bleeding: event.target.value }, () => {
    //     this.validateField('bleeding')
    //   })
    // }

    // updateSkinCancer = (event) => {
    //   this.setState({ skinCancer: event.target.value }, () => {
    //     this.validateField('skinCancer')
    //   })
    // }

    // updateSexuallyActive = (event) => {
    //   this.setState({ sexuallyActive: event.target.value }, () => {
    //     this.validateField('sexuallyActive')
    //   })
    // }

    checkCountry = () => {
      this.validateField('country')

      if (this.state.country === 'US') {
        requiredFields.push('region')
      } else {
        // if region is in the required fields array, remove it
        let index = requiredFields.indexOf('region')
        if (index > -1)
          requiredFields.splice(index, 1)

        this.setState({ region: '' })
        this.regionInput.select.clearValue()
      }
    }

    validateField = (fieldName) => {
      const errors = this.state.errors

      if (!isNotEmptyString(this.state[fieldName])) {
        errors.push(fieldName)
      } else {
        pull(errors, fieldName)
      }

      this.setState({ errors: errors })
    }

    runValidation = async () => {
      // reset error states
      await this.setState({ errors: [] })

      let errors = []
      let length = requiredFields.length

      for (var fieldIndex = 0; fieldIndex < length; fieldIndex++) {
        let fieldName = requiredFields[fieldIndex]
        if (!isNotEmptyString(this.state[fieldName])) {
          errors.push(fieldName)
        }
      }

      await this.setState({ errors: errors })

      if (errors.length > 0) {
        // First reset it so it will still take the user to the anchor even if
        // we already took them there before (still error on same field)
        window.location.hash = `#`;

        // Go to first error field
        window.location.hash = `#${errors[0]}`;
      }
    }

    handleSubmit = async (event) => {
      event.preventDefault()

      await this.runValidation()

      if (!this.props.balance)
        console.error("The props.balance wasn't set!")

      if (this.state.errors.length === 0) {
        if (weiToMedX(this.props.balance) < 15) {
          if (this.props.previousCase) {
            this.setState({ showBalanceTooLowModal: true })
          } else if (this.props.medXBeingSent) {
            toastr.warning('Your MEDX is on the way. Please wait for the transaction to finish prior to submitting your case.')
          } else {
            this.props.showBetaFaucetModal()
          }
        } else {
          this.setState({ showConfirmSubmissionModal: true })
        }
      }
    }

    handleCloseBalanceTooLowModal = (event) => {
      event.preventDefault()
      this.setState({ showBalanceTooLowModal: false })
    }

    handleCloseDisclaimerModal = (event) => {
      event.preventDefault();
      this.setState({ showDisclaimerModal: false });
    }

    handleCancelConfirmSubmissionModal = (event) => {
      event.preventDefault()
      this.setState({ showConfirmSubmissionModal: false })
    }

    handleAcceptConfirmSubmissionModal = (event) => {
      event.preventDefault()

      this.setState({
        showConfirmSubmissionModal: false,
        isSubmitting: true
      }, this.doCreateCase)
    }

    doCreateCase = async () => {
      let retries = 0
      const maxRetries = 3
      let transactionId

      while(transactionId === undefined) {
        try {
          transactionId = await this.createNewCase()

          if (transactionId) {
            this.setState({
              transactionId,
              createCaseEvents: new TransactionStateHandler()
            })
          }
        } catch (error) {
          if (++retries === maxRetries) {
            toastr.error('There was an issue creating your case, please try again.')
            this.setState({
              showConfirmSubmissionModal: true,
              isSubmitting: false
            })
            console.error(error)
            return
          }
        }
      }
    }

    onChangeDoctor = (option) => {
      this.setState({
        selectedDoctor: option
      })
    }

    createNewCase = async () => {
      const { send, MedXToken, CaseManager } = this.props
      const caseInformation = {
        firstImageHash: this.state.firstImageHash,
        secondImageHash: this.state.secondImageHash,
        gender: this.state.gender,
        allergies: this.state.allergies,
        pregnant: this.state.pregnant,
        whatAllergies: this.state.whatAllergies,
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
      const doctorEncryptedCaseKey = reencryptCaseKey({ account, encryptedCaseKey, doctorPublicKey, caseKeySalt })

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

      return await send(MedXToken, 'approveAndCall', CaseManager, medXToWei('15'), data)({ gas: 1600000 })
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
                    <div className="col-xs-12 col-md-9">
                      <p className="lead lead--card-title">
                        Tell your physician about your problem by answering the questions below.
                      </p>
                      <p className="text-gray">
                        All information is encrypted and visible to only you and your physician. <a onClick={(e) => this.setState({ showDisclaimerModal: true })}>Read Disclaimer</a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="form-wrapper">
                    <form onSubmit={this.handleSubmit}>

                      <div className="form-group--heading">
                        Your Info:
                      </div>

                      <YourInfo
                        errors={errors}
                        textInputOnChange={this.handleTextInputOnChange}
                        textInputOnBlur={this.handleTextInputOnBlur}
                        buttonGroupOnChange={this.handleButtonGroupOnChange}
                        gender={this.state.gender}
                        allergies={this.state.allergies}
                      />

                      <div className="form-group--heading">
                        Imagery:
                      </div>
                      <HippoImageInput
                        name='firstImage'
                        id='firstImageHash'
                        label="Overview Photo:"
                        colClasses='col-xs-12 col-sm-12 col-md-8'
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
                        colClasses='col-xs-12 col-sm-12 col-md-8'
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
                        colClasses='col-xs-12 col-md-8'
                        label='How long have you had this problem?'
                        error={errors['howLong']}
                        setRef={this.setHowLongRef}
                        onChange={this.updateHowLong}
                        values={['Days', 'Weeks', 'Months', 'Years']}
                      />

                      <HippoToggleButtonGroup
                        id='size'
                        name="size"
                        colClasses='col-xs-12 col-md-8'
                        label='Is it growing, shrinking or staying the same size?'
                        error={errors['size']}
                        setRef={this.setSizeRef}
                        onChange={this.updateSize}
                        values={['Growing', 'Shrinking', 'Same size']}
                      />

                      <HippoToggleButtonGroup
                        id='painful'
                        name="painful"
                        colClasses='col-xs-12 col-md-8'
                        label='Is it painful?'
                        error={errors['painful']}
                        setRef={this.setPainfulRef}
                        onChange={this.updatePainful}
                        values={['Yes', 'No']}
                      />

                      <HippoToggleButtonGroup
                        id='bleeding'
                        name="bleeding"
                        colClasses='col-xs-12 col-md-8'
                        label='Is it bleeding?'
                        error={errors['bleeding']}
                        setRef={this.setBleedingRef}
                        onChange={this.updateBleeding}
                        values={['Yes', 'No']}
                      />

                      <HippoToggleButtonGroup
                        id='itching'
                        name="itching"
                        colClasses='col-xs-12 col-md-8'
                        label='Is it itching?'
                        error={errors['itching']}
                        setRef={this.setItchingRef}
                        onChange={this.updateItching}
                        values={['Yes', 'No']}
                      />

                      <HippoToggleButtonGroup
                        id='skinCancer'
                        name="skinCancer"
                        colClasses='col-xs-12 col-md-8'
                        label='Any history of skin cancer?'
                        error={errors['skinCancer']}
                        setRef={this.setSkinCancerRef}
                        onChange={this.updateSkinCancer}
                        values={['Yes', 'No']}
                      />

                      <HippoToggleButtonGroup
                        id='sexuallyActive'
                        name="sexuallyActive"
                        colClasses='col-xs-12 col-md-8'
                        label='Are you sexually active?'
                        error={errors['sexuallyActive']}
                        setRef={this.setSexuallyActiveRef}
                        onChange={this.updateSexuallyActive}
                        values={['Yes', 'No']}
                      />

                      <HippoTextInput
                        id='color'
                        name="color"
                        colClasses='col-xs-12 col-sm-12 col-md-8'
                        label='Has it changed in color?'
                        error={errors['color']}
                        setRef={this.setColorRef}
                        onBlur={this.validateField}
                        onChange={(event) => this.setState({ color: event.target.value })}
                      />

                      <HippoTextInput
                        id='prevTreatment'
                        name="prevTreatment"
                        colClasses='col-xs-12 col-sm-12 col-md-8'
                        label='Have you tried any treatments so far?'
                        error={errors['prevTreatment']}
                        setRef={this.setPrevTreatmentRef}
                        onBlur={this.validateField}
                        onChange={(event) => this.setState({ prevTreatment: event.target.value })}
                      />


                      <div className="form-group--heading">
                        Additional Info:
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-sm-6 col-md-3">
                          <div className={classNames('form-group', { 'has-error': errors['country'] })}>
                            <label className="control-label">Country</label>
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
                        <div className="col-xs-8 col-sm-3 col-md-3">
                          <div className={classNames('form-group', { 'has-error': errors['region'] })}>
                            <label className="control-label">State</label>
                            <Select
                              isDisabled={this.state.country !== 'US'}
                              placeholder='Please select your State'
                              styles={customStyles}
                              components={Animated}
                              closeMenuOnSelect={true}
                              ref={this.setRegionRef}
                              options={regions}
                              onChange={(newValue) => {
                                this.setState({ region: newValue ? newValue.value : '' }, () => {
                                  if (this.state.country === 'US') {
                                    this.validateField('region')
                                  }
                                })
                              }}
                              selected={this.state.region}
                            />
                            {errors['region']}
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-8">
                          <div className="form-group">
                            <label className="control-label">Please include any additional info below <span className="text-gray">(Optional)</span></label>
                            <textarea
                              onChange={(event) => this.setState({ description: event.target.value })}
                              className="form-control"
                              rows="5" />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-8">
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
                              <AvailableDoctorSelect
                                excludeAddresses={[this.props.account]}
                                value={this.state.selectedDoctor}
                                onChange={this.onChangeDoctor} />
                             }

                            {errors['selectedDoctor']}
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-8 text-right">
                          <button
                            type="submit"
                            className="btn btn-lg btn-success"
                            data-tip={this.props.medXBeingSent ? "Your MedX transaction needs to complete, please wait ..." : ''}
                          >
                            Submit Case
                          </button>
                          <ReactTooltip effect='solid' place='left' />
                          <br />
                          <br />
                          <br />
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

          <Modal show={this.state.showDisclaimerModal}>
            <Modal.Header>
               <Modal.Title>
                  Disclaimer:
                </Modal.Title>
             </Modal.Header>
            <Modal.Body>
              <p>
                The MedCredits Health System is a decentralized platform that connects patients
                and doctors globally. The MedCredits team does not have access to any patient
                information, and does not guarantee any outcome on behalf of the doctors or
                patients. For all evaluated cases, there is an option for a discounted second
                opinion. However, patients should see a local medical provider if there is a
                degree of concern. Lastly, an evaluation on Hippocrates is only as good as the
                photos provided. So be sure the photos are high quality!
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                onClick={this.handleCloseDisclaimerModal}
                bsStyle="primary">
                OK
              </Button>
            </Modal.Footer>
          </Modal>

          <Loading loading={this.state.isSubmitting} />
        </div>
      )
    }
}))))

export const CreateCaseContainer = withRouter(CreateCase)
