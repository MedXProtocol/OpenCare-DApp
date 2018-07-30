import React, { Component } from 'react'
import { connect } from 'react-redux'
import { cold } from 'react-hot-loader';
import { Button, Modal } from 'react-bootstrap'
import { toastr } from '~/toastr'
import ReactTooltip from 'react-tooltip'
import { withRouter } from 'react-router-dom'
import classnames from 'classnames'
import { isTrue } from '~/utils/isTrue'
import { sleep } from '~/utils/sleep'
import { isNotEmptyString } from '~/utils/common-util'
import { cancelablePromise } from '~/utils/cancelablePromise'
import { uploadJson, uploadFile } from '~/utils/storage-util'
import hashToHex from '~/utils/hash-to-hex'
import { weiToMedX } from '~/utils/weiToMedX'
import { medXToWei } from '~/utils/medXToWei'
import get from 'lodash.get'
import getWeb3 from '~/get-web3'
import { genKey } from '~/services/gen-key'
import { currentAccount } from '~/services/sign-in'
import { jicImageCompressor } from '~/services/jicImageCompressor'
import { withContractRegistry, cacheCall, cacheCallValue, withSaga, withSend } from '~/saga-genesis'
import { contractByName } from '~/saga-genesis/state-finders'
import { DoctorSelect } from '~/components/DoctorSelect'
import { reencryptCaseKey } from '~/services/reencryptCaseKey'
import { getExifOrientation } from '~/services/getExifOrientation'
import { mixpanel } from '~/mixpanel'
import { TransactionStateHandler } from '~/saga-genesis/TransactionStateHandler'
import { Loading } from '~/components/Loading'
import { HippoImageInput } from '~/components/forms/HippoImageInput'
import { PatientInfo } from './PatientInfo'
import { SpotQuestions } from './SpotQuestions'
import { RashQuestions } from './RashQuestions'
import { AcneQuestions } from './AcneQuestions'
import { AvailableDoctorSelect } from '~/components/AvailableDoctorSelect'
import pull from 'lodash.pull'
import FlipMove from 'react-flip-move'
import { promisify } from '~/utils/common-util'

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
  'age',
  'gender',
  'country',
  'allergies',
  'spotRashOrAcne',
  'firstImageHash',
  'secondImageHash',
  'howLong',
  'sexuallyActive',
  'prevTreatment',
  'selectedDoctor'
]
// These fields are dynamically added as required depending on choices the user makes:
// 'pregnant' => female only
// 'whatAllergies' => allergies yes only
// 'region' => USA only
// 'worseWithPeriod' => female and acne only
// 'onBirthControl' => female and acne only
// 'hadBefore' => spot/rash only

export const CreateCase = withContractRegistry(connect(mapStateToProps, mapDispatchToProps)(withSaga(saga, { propTriggers: ['account', 'MedXToken', 'AccountManager'] })(withSend(class _CreateCase extends Component {
    constructor(){
      super()

      this.state = {
        firstImageHash: null,
        firstImageFileName: null,
        firstImagePercent: null,
        secondImageHash: null,
        secondImageFileName: null,
        secondImagePercent: null,
        gender: null,
        allergies: null,
        pregnant: null,
        whatAllergies: null,
        spotRashOrAcne: null,
        howLong: null,
        hadBefore: null,
        isTheSpot: [],
        isTheRash: [],
        acneDoesItInclude: [],
        sexuallyActive: null,
        age: null,
        country: null,
        region: null,
        prevTreatment: null,
        description: null,
        onBirthControl: null,
        worseWithPeriod: null,
        caseEncryptionKey: genKey(32),
        showBalanceTooLowModal: false,
        showConfirmSubmissionModal: false,
        showPublicKeyModal: false,
        showTermsModal: false,
        isSubmitting: false,
        errors: []
      }

      this.setCountryRef = element => { this.countryInput = element }
      this.setRegionRef = element => { this.regionInput = element }
    }

    handleButtonGroupOnChange = (event) => {
      this.setState({ [event.target.name]: event.target.value }, () => {
        this.validateField(event.target.name)

        this.setOrClearRequired(event.target.name)
      })
    }

    setOrClearRequired = (fieldName) => {
      if (fieldName === 'gender') {
        if (this.state.gender === 'Female') {
          requiredFields.splice(2, 0, 'pregnant')

          if (this.state.spotRashOrAcne === 'Acne') {
            const howLongIndex = requiredFields.indexOf('howLong')
            requiredFields.splice(howLongIndex + 1, 0, 'worseWithPeriod')
            requiredFields.splice(howLongIndex + 2, 0, 'onBirthControl')
          }
        } else {
          pull(requiredFields, 'pregnant')
          this.setState({ pregnant: null })

          if (this.state.spotRashOrAcne === 'Acne') {
            pull(requiredFields, 'worseWithPeriod', 'onBirthControl')
            this.setState({ worseWithPeriod: null, onBirthControl: null })
          }
        }
      }

      if (fieldName === 'spotRashOrAcne') {
        if (this.state.spotRashOrAcne === 'Acne' && this.state.gender === 'Female') {
          const howLongIndex = requiredFields.indexOf('howLong')
          requiredFields.splice(howLongIndex + 1, 0, 'worseWithPeriod')
          requiredFields.splice(howLongIndex + 2, 0, 'onBirthControl')
        } else {
          pull(requiredFields, 'worseWithPeriod', 'onBirthControl')
          this.setState({ worseWithPeriod: null, onBirthControl: null })
        }
      }

      if (fieldName === 'allergies') {
        if (this.state.allergies === 'Yes') {
          const allergiesIndex = requiredFields.indexOf('allergies')
          requiredFields.splice(allergiesIndex, 0, 'whatAllergies')
        } else {
          pull(requiredFields, 'whatAllergies')
          this.setState({ whatAllergies: null })
        }
      }

      if (fieldName === 'spotRashOrAcne') {
        if (this.state.spotRashOrAcne === 'Spot' || this.state.spotRashOrAcne === 'Rash') {
          const howLongIndex = requiredFields.indexOf('howLong')
          requiredFields.splice(howLongIndex, 0, 'hadBefore')
        } else {
          pull(requiredFields, 'hadBefore')
          this.setState({ hadBefore: null })
        }
      }
    }

    handleCheckboxGroupOnChange = (event) => {
      let currentValues = this.state[event.target.name]

      if (currentValues.includes(event.target.value)) {
        pull(currentValues, event.target.value)
      } else {
        currentValues.push(event.target.value)
      }

      this.setState({ [event.target.name]: currentValues })
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
            toastr.success('Your case has been broadcast to the network. It will take a moment to be confirmed.')
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

    handleCaptureImage = async (file, imageToCapture) => {
      if (!file) { return }

      await this.handleResetImageState(imageToCapture)

      const error = this.validateFile(file)
      if (error) {
        this.setState({ [`${imageToCapture}Error`]: error })
        return
      }

      const fileName = file.name
      const progressHandler = (percent) => {
        this.setState({ [`${imageToCapture}Percent`]: percent })
      }

      const cancelableUploadPromise = cancelablePromise(
        new Promise(async (resolve, reject) => {
          const orientation = await this.srcImgOrientation(file)
          const blob = await this.compressFile(file, orientation)
          progressHandler(10)
          await sleep(300)

          var arrayBuffer
          var fileReader = new FileReader()
          await this.promisifyFileReader(fileReader, blob)
          arrayBuffer = fileReader.result

          progressHandler(20)
          await sleep(300)

          uploadFile(arrayBuffer, this.state.caseEncryptionKey, progressHandler).then(imageHash => {
            return resolve(imageHash)
          })
        })
      )
      await this.setState({ [`${imageToCapture}UploadPromise`]: cancelableUploadPromise })

      cancelableUploadPromise
        .promise
        .then((imageHash) => {
          this.setState({
            [`${imageToCapture}Hash`]: imageHash,
            [`${imageToCapture}FileName`]: fileName,
            [`${imageToCapture}Percent`]: null
          })

          this.validateField(`${imageToCapture}Hash`)
        })
        .catch((reason) => {
          // cancel pressed
          this.handleResetImageState(imageToCapture)
        })
    }

    srcImgOrientation = async (file) => {
      return await getExifOrientation(file)
    }

    handleResetImageState = async (image) => {
      await this.setState({
        [`${image}UploadPromise`]: undefined,
        [`${image}Hash`]: null,
        [`${image}FileName`]: null,
        [`${image}Percent`]: null,
        [`${image}Error`]: null
      })
    }

    promisifyFileReader = (fileReader, blob) => {
      return new Promise((resolve, reject) => {
        fileReader.onloadend = resolve
        fileReader.readAsArrayBuffer(blob)
      })
    }

    calculateScalePercent(sourceWidth, sourceHeight, targetSize) {
      let resizeRatio
      if ((sourceWidth / sourceHeight) > 1) {
        resizeRatio = (targetSize / sourceWidth)
      } else {
        resizeRatio = (targetSize / sourceHeight)
      }
      // console.log(`${sourceWidth}x${sourceHeight} => ${sourceWidth*resizeRatio}x${sourceHeight*resizeRatio}. Resize Ratio is: ${resizeRatio}`)
      return resizeRatio
    }

    async compressFile(file, orientation) {
      const qualityPercent = 0.5

      return await promisify(cb => {
        const image = new Image()

        image.onload = (event) => {
          let error
          const width = event.target.width
          const height = event.target.height

          const scalePercent = this.calculateScalePercent(width, height, 1000)

          const canvas = jicImageCompressor.compress(image, qualityPercent, scalePercent, orientation)
          // console.log('source img length: ' + event.target.src.length)
          // console.log('compressed img length: ' + event.target.src.length)

          canvas.toBlob((blob) => { cb(error, blob) }, "image/jpeg", qualityPercent)
        }

        image.src = window.URL.createObjectURL(file)
      })
    }

    handleCancelUpload = async (imageToCancel) => {
      if (imageToCancel === 'firstImage' && this.state.firstImageUploadPromise) {
        this.state.firstImageUploadPromise.cancel()
      } else if (this.state.secondUploadPromise) {
        this.state.secondUploadPromise.cancel()
      }
    }

    checkCountry = () => {
      this.validateField('country')

      if (this.state.country === 'US') {
        requiredFields.push('region')
      } else {
        // if region is in the required fields array, remove it
        let index = requiredFields.indexOf('region')
        if (index > -1) {
          requiredFields.splice(index, 1)
        }

        this.setState({ region: '' })
        this.regionInput.select.clearValue()
      }
    }

    validateField = (fieldName) => {
      if (!requiredFields.includes(fieldName)) {
        return
      }

      const errors = this.state.errors

      if (!isNotEmptyString(this.state[fieldName])) {
        errors.push(fieldName)
      } else {
        pull(errors, fieldName)
      }

      if (errors.includes('firstImageHash')) {
        this.handleResetImageState('firstImage')
      } else if (errors.includes('secondImageHash')) {
        this.handleResetImageState('secondImage')
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
            toastr.warning('Your MEDT (Test MEDX) is on the way. Please wait for the transaction to finish prior to submitting your case.')
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
      if (event) {
        event.preventDefault()
      }
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
          await sleep(1200)

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

    handleCountryChange = (newValue) => {
      this.setState({ country: newValue.value }, this.checkCountry)
    }

    handleRegionChange = (newValue) => {
      this.setState({ region: newValue ? newValue.value : '' }, () => {
        if (this.state.country === 'US') {
          this.validateField('region')
        }
      })
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
        spotRashOrAcne: this.state.spotRashOrAcne,
        howLong: this.state.howLong,
        hadBefore: this.state.hadBefore,
        isTheSpot: this.state.isTheSpot.join(', '),
        isTheRash: this.state.isTheRash.join(', '),
        acneDoesItInclude: this.state.acneDoesItInclude.join(', '),
        worseWithPeriod: this.state.worseWithPeriod,
        onBirthControl: this.state.onBirthControl,
        skinCancer: this.state.skinCancer,
        sexuallyActive: this.state.sexuallyActive,
        age: this.state.age,
        country: this.state.country,
        region: this.state.region,
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

    fileUploadActive = (percent) => {
      return (percent !== null) ? true : false
    }

    errorMessage = (fieldName) => {
      let msg
      if (fieldName === 'country' || fieldName === 'region') {
        msg = 'must be chosen'
      } else if (fieldName.match(/ImageHash/g)) {
        msg = 'There was an error uploading this image. Please choose a photo and wait for it to complete uploading'
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

      if (this.state.firstImageError) {
        var firstImageError = <p className='has-error help-block'>{this.state.firstImageError}</p>
      }

      if (this.state.secondImageError) {
        var secondImageError = <p className='has-error help-block'>{this.state.secondImageError}</p>
      }

      if (this.state.spotRashOrAcne === 'Spot') {
        var spotQuestions = <SpotQuestions
          errors={errors}
          textInputOnChange={this.handleTextInputOnChange}
          textInputOnBlur={this.handleTextInputOnBlur}
          buttonGroupOnChange={this.handleButtonGroupOnChange}
          checkboxGroupOnChange={this.handleCheckboxGroupOnChange}
        />
      } else if (this.state.spotRashOrAcne === 'Rash') {
        var rashQuestions =<RashQuestions
          errors={errors}
          textInputOnChange={this.handleTextInputOnChange}
          textInputOnBlur={this.handleTextInputOnBlur}
          buttonGroupOnChange={this.handleButtonGroupOnChange}
          checkboxGroupOnChange={this.handleCheckboxGroupOnChange}
        />
      } else if (this.state.spotRashOrAcne === 'Acne') {
        var acneQuestions = <AcneQuestions
          errors={errors}
          textInputOnChange={this.handleTextInputOnChange}
          textInputOnBlur={this.handleTextInputOnBlur}
          buttonGroupOnChange={this.handleButtonGroupOnChange}
          checkboxGroupOnChange={this.handleCheckboxGroupOnChange}
          gender={this.state.gender}
        />
      }

      return (
        <div>
          <div className="row">
            <div className="col-xs-12 col-md-8 col-md-offset-2">
              <div className="card">
                <div className="card-header">
                  <div className="row">
                    <div className="col-xs-12 col-md-12">
                      <p className="lead lead--card-title">
                        Tell your physician about your problem by answering the questions below.
                      </p>
                      <p className="text-gray">
                        All information is encrypted and visible to only you and your physician. <a onClick={(e) => this.setState({ showDisclaimerModal: true })}>Read Disclaimer</a>
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={this.handleSubmit}>
                  <div className="card-body">
                    <PatientInfo
                      errors={errors}
                      textInputOnChange={this.handleTextInputOnChange}
                      textInputOnBlur={this.handleTextInputOnBlur}
                      buttonGroupOnChange={this.handleButtonGroupOnChange}
                      gender={this.state.gender}
                      allergies={this.state.allergies}
                      setCountryRef={this.setCountryRef}
                      setRegionRef={this.setRegionRef}
                      country={this.state.country}
                      region={this.state.region}
                      handleCountryChange={this.handleCountryChange}
                      handleRegionChange={this.handleRegionChange}
                    />

                    <FlipMove
                      enterAnimation="accordionVertical"
                      leaveAnimation="accordionVertical"
                      maintainContainerHeight={true}
                    >
                      {
                        this.state.spotRashOrAcne ? (
                          <div key="imagery-key">
                            <div className="form-group--heading">
                              Imagery:
                            </div>
                            <HippoImageInput
                              name='firstImage'
                              id='firstImageHash'
                              label="Overview Photo:"
                              colClasses='col-xs-12 col-sm-9'
                              error={errors['firstImageHash']}
                              fileError={firstImageError}
                              handleCaptureImage={this.handleCaptureImage}
                              handleResetImageState={this.handleResetImageState}
                              handleCancelUpload={this.handleCancelUpload}
                              uploadPromise={this.state.firstImageUploadPromise}
                              currentValue={this.state.firstImageFileName}
                              fileUploadActive={this.fileUploadActive(this.state.firstImagePercent)}
                              progressPercent={this.state.firstImagePercent}
                            />
                            {/*<img
                              id="first-image-source"
                              className="img-responsive form-group--image-upload-preview hidden"
                              alt="firstImage from user"
                            />
                            <img
                              id="first-image-preview"
                              className="img-responsive form-group--image-upload-preview hidden"
                              alt="firstImage to upload"
                            />*/}

                            <HippoImageInput
                              name='secondImage'
                              id='secondImageHash'
                              label={'Close-up Photo:'}
                              subLabel={this.state.spotRashOrAcne === 'Spot' ? '' : '(separate location from above if on more than one body part)'}
                              colClasses='col-xs-12 col-sm-9'
                              error={errors['secondImageHash']}
                              fileError={secondImageError}
                              handleCaptureImage={this.handleCaptureImage}
                              handleResetImageState={this.handleResetImageState}
                              handleCancelUpload={this.handleCancelUpload}
                              uploadPromise={this.state.secondImageUploadPromise}
                              currentValue={this.state.secondImageFileName}
                              fileUploadActive={this.fileUploadActive(this.state.secondImagePercent)}
                              progressPercent={this.state.secondImagePercent}
                            />
                          </div>
                        ) : null
                      }
                    </FlipMove>

                    <div className="form-group--heading">
                      Details:
                    </div>

                    {spotQuestions}
                    {rashQuestions}
                    {acneQuestions}

                    <div className="row">
                      <div className="col-xs-12 col-sm-12 col-md-12">
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
                      <div className="col-xs-12 col-sm-12 col-md-12">
                        <div className={classnames("form-group", { 'has-error': !!errors['selectedDoctor'] })}>
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
                  </div>
                  <div className="card-footer text-right">
                    <button
                      type="submit"
                      className="btn btn-lg btn-success"
                      data-tip={this.props.medXBeingSent ? "Your MedX transaction needs to complete, please wait ..." : ""}
                    >
                      Submit Case
                    </button>
                    <ReactTooltip effect='solid' place='top' />
                  </div>
                </form>
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
                  <h4>You need 15 MEDT (Test MEDX) to submit a case.</h4>
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
                    This will cost you between 5 - 15 MEDT (Test MEDX).
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

          <Modal show={this.state.showDisclaimerModal} onHide={this.handleCloseDisclaimerModal}>
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

export const CreateCaseContainer = cold(withRouter(CreateCase))
