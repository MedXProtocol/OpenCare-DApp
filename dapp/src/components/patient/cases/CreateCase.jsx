import React, { Component } from 'react';
import { connect } from 'react-redux'
import { toastr } from 'react-redux-toastr'
import {
  ControlLabel,
  FormGroup,
  Modal,
  ProgressBar,
  ToggleButtonGroup,
  ToggleButton,
  ButtonToolbar
} from 'react-bootstrap';
import { genKey } from '~/services/gen-key'
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import { isNotEmptyString } from '~/utils/common-util';
import { uploadJson, uploadFile } from '~/utils/storage-util';
import { getAccount } from '~/services/sign-in'
import { withContractRegistry, cacheCall, cacheCallValue, withSaga, withSend } from '~/saga-genesis'
import hashToHex from '~/utils/hash-to-hex'
import aes from '~/services/aes'
import get from 'lodash.get'
import getWeb3 from '~/get-web3'
import { contractByName } from '~/saga-genesis/state-finders'

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
        canSubmit: false,
        showBalanceTooLowModal: false,
        showConfirmSubmissionModal: false
      };
    }

    componentWillReceiveProps (props) {
      if (this.state.transactionId) {
        if (get(props, `transactions[${this.state.transactionId}].submitted`)) {
          toastr.light('Success', 'Your case has been submitted.', { icon: 'success', status: 'success' })
          this.props.history.push('/patients/cases');
        }
      }
    }

    fileTooLarge (size) {
      return size > 10485760 // 10 megabytes
    }

    captureFirstImage = async (event) => {
      this.setState({firstFileError: null})
      if (this.fileTooLarge(event.target.files[0].size)) {
        this.setState({
          firstFileError: 'The file must be smaller than 10MB'
        })
        return
      }

      const fileName = event.target.files[0].name;
      const progressHandler = (percent) => {
        this.setState({ firstImagePercent: percent })
      }
      // Clear out previous values
      this.setState({
        firstImageHash: null,
        firstFileName: null
      });

      const imageHash = await this.captureFile(event, progressHandler);
      this.setState({
        firstImageHash: imageHash,
        firstFileName: fileName
      }, this.validateInputs);
    }

    captureSecondImage = async (event) => {
      this.setState({secondFileError: null})
      if (this.fileTooLarge(event.target.files[0].size)) {
        this.setState({
          secondFileError: 'The file must be smaller than 10MB'
        })
        return
      }

      const fileName = event.target.files[0].name;
      const progressHandler = (percent) => {
        this.setState({ secondImagePercent: percent })
      }
      // Clear out previous values
      this.setState({
        secondImageHash: null,
        secondFileName: null
      });

      const imageHash = await this.captureFile(event, progressHandler);
      this.setState({
        secondImageHash: imageHash,
        secondFileName: fileName
      }, this.validateInputs);
    }

    captureFile = async (event, progressHandler) => {
      event.stopPropagation()
      event.preventDefault()
      const file = event.target.files[0]
      const imageHash = await uploadFile(file, this.state.caseEncryptionKey, progressHandler);

      return imageHash;
    }

    updateHowLong = (event) => {
      this.setState({ howLong: event.target.value }, this.validateInputs);
    }

    updateSize = (event) => {
      this.setState({ size: event.target.value }, this.validateInputs);
    }

    updatePainful = (event) => {
      this.setState({ painful: event.target.value }, this.validateInputs);
    }

    updateItching = (event) => {
      this.setState({ itching: event.target.value }, this.validateInputs);
    }

    updateBleeding = (event) => {

      this.setState({ bleeding: event.target.value }, this.validateInputs);
    }

    updateSkinCancer = (event) => {
      this.setState({ skinCancer: event.target.value }, this.validateInputs);
    }

    updateColor = (event) => {
      this.setState({ color: event.target.value }, this.validateInputs);
    }

    updatePreviousTreatment = (event) => {
      this.setState({ prevTreatment: event.target.value }, this.validateInputs);
    }

    updateSexuallyActive = (event) => {
      this.setState({ sexuallyActive: event.target.value }, this.validateInputs);
    }

    updateAge = (event) => {
      this.setState({ age: event.target.value }, this.validateInputs);
    }

    updateCountry = (event) => {
      this.setState({ country: event.target.value }, this.validateInputs);
    }

    updateDescription = (event) => {
      this.setState({ description: event.target.value });
    }

    handleSubmit = (event) => {
      event.preventDefault()
      if(this.props.balance < 15) {
        this.setState({showBalanceTooLowModal: true});
      } else {
        this.setState({showConfirmSubmissionModal: true});
      }
    }

    validateInputs = () => {
      const valid =
        isNotEmptyString(this.state.firstImageHash) &&
        isNotEmptyString(this.state.secondImageHash) &&
        isNotEmptyString(this.state.howLong) &&
        isNotEmptyString(this.state.size) &&
        isNotEmptyString(this.state.painful) &&
        isNotEmptyString(this.state.bleeding) &&
        isNotEmptyString(this.state.itching) &&
        isNotEmptyString(this.state.skinCancer) &&
        isNotEmptyString(this.state.sexuallyActive) &&
        isNotEmptyString(this.state.age) &&
        isNotEmptyString(this.state.country) &&
        isNotEmptyString(this.state.color) &&
        isNotEmptyString(this.state.prevTreatment);

      this.setState({ canSubmit: valid });
    }

    handleCloseBalanceTooLowModal = (event) => {
      event.preventDefault();
      this.setState({ showBalanceTooLowModal: false });
    }

    handleCancelConfirmSubmissionModal = (event) => {
      event.preventDefault();
      this.setState({ showConfirmSubmissionModal: false });
    }

    handleAcceptConfirmSubmissionModal = async (event) => {
      event.preventDefault();

      await this.createNewCase();
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
        };

        const caseJson = JSON.stringify(caseInformation);
        const hash = await uploadJson(caseJson, this.state.caseEncryptionKey);
        const account = getAccount()
        const encryptedCaseKey = account.encrypt(this.state.caseEncryptionKey)

        const { send, MedXToken, CaseManager } = this.props
        let hashHex = hashToHex(hash)

        let CaseManagerContract = this.props.contractRegistry.get(this.props.CaseManager, 'CaseManager', getWeb3())
        let data = CaseManagerContract.methods.createCase(this.props.account, '0x' + encryptedCaseKey, '0x' + hashHex).encodeABI()
        let transactionId = send(MedXToken, 'approveAndCall', CaseManager, 15, data)()

        this.setState({ transactionId })
    }

    render() {
      let firstProgressClassNames = classNames(
        'progress-bar--wrapper',
        {
          show: this.state.firstImagePercent > 0 && this.state.firstImagePercent < 100,
          hide: this.state.firstImagePercent === 0 || this.state.firstImagePercent === 100
        }
      )

      let secondProgressClassNames = classNames(
        'progress-bar--wrapper',
        {
          show: this.state.secondImagePercent > 0 && this.state.secondImagePercent < 100,
          hide: this.state.secondImagePercent === 0 || this.state.secondImagePercent === 100
        }
      )

      if (this.state.firstFileError) {
        var firstFileError =
          <p className='has-error help-block'>{this.state.firstFileError}</p>
        var firstFileClassName = 'has-error'
      }

      if (this.state.secondFileError) {
        var secondFileError =
          <p className='has-error help-block'>{this.state.secondFileError}</p>
        var secondFileClassName = 'has-error'
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
                    <form onSubmit={this.handleSubmit} >
                      <div className="form-group--heading">
                        Imagery:
                      </div>
                      <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-6">
                          <div className={classNames('form-group', firstFileClassName)}>
                            <label className='control-label'>Overview Photo<span className='star'>*</span></label>
                            <div>
                              <label className="btn btn btn-info">
                                Select File ... <input
                                            onChange={this.captureFirstImage}
                                            type="file"
                                            accept='image/*'
                                            className="form-control"
                                            style={{ display: 'none' }}
                                            required />
                              </label>
                              <span>
                                &nbsp; {this.state.firstFileName}
                              </span>
                              <div className={firstProgressClassNames}>
                                <ProgressBar
                                  active
                                  striped
                                  bsStyle="success"
                                  now={this.state.firstImagePercent} />
                              </div>
                              {firstFileError}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-6">
                          <div className={classNames('form-group', secondFileClassName)}>
                            <label>Close-up Photo<span className='star'>*</span></label>
                            <div>
                              <label className="btn btn btn-info">
                                  Select File ... <input
                                              onChange={this.captureSecondImage}
                                              type="file"
                                              accept='image/*'
                                              className="form-control"
                                              style={{ display: 'none' }}
                                              required />
                              </label>
                              <span>
                                  &nbsp; {this.state.secondFileName}
                              </span>
                              <div className={secondProgressClassNames}>
                                <ProgressBar
                                  active
                                  striped
                                  bsStyle="success"
                                  now={this.state.secondImagePercent} />
                              </div>
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
                          <FormGroup>
                            <ControlLabel>How long have you had this problem?<span className='star'>*</span></ControlLabel>

                            <ButtonToolbar>
                              <ToggleButtonGroup name="howLong" type="radio">
                                <ToggleButton
                                  onChange={this.updateHowLong}
                                  value='Days'
                                  required>
                                  Days
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updateHowLong}
                                  value='Weeks'
                                  required>
                                  Weeks
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updateHowLong}
                                  value='Months'
                                  required>
                                  Months
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updateHowLong}
                                  value='Years'
                                  required>
                                  Years
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </ButtonToolbar>
                          </FormGroup>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-xs-12 col-md-6">
                          <FormGroup>
                            <ControlLabel>Is it growing, shrinking or staying the same size?<span className='star'>*</span></ControlLabel>
                            <ButtonToolbar>
                              <ToggleButtonGroup name="size" type="radio">
                                <ToggleButton
                                  onChange={this.updateSize}
                                  value='Growing'
                                  required>
                                  Growing
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updateSize}
                                  value='Shrinking'
                                  required>
                                  Shrinking
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updateSize}
                                  value='Same size'
                                  required>
                                  Same size
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </ButtonToolbar>
                          </FormGroup>
                        </div>
                      </div>


                      <div className="row">
                        <div className="col-xs-12 col-md-6">
                          <FormGroup>
                            <ControlLabel>Is it painful?<span className='star'>*</span></ControlLabel>

                            <ButtonToolbar>
                              <ToggleButtonGroup name="painful" type="radio">
                                <ToggleButton
                                  onChange={this.updatePainful}
                                  value='Yes'
                                  required>
                                  Yes
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updatePainful}
                                  value='No'
                                  required>
                                  No
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </ButtonToolbar>
                          </FormGroup>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-md-6">
                          <FormGroup>
                            <ControlLabel>Is it bleeding?<span className='star'>*</span></ControlLabel>

                            <ButtonToolbar>
                              <ToggleButtonGroup name="bleeding" type="radio">
                                <ToggleButton
                                  onChange={this.updateBleeding}
                                  value='Yes'
                                  required>
                                  Yes
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updateBleeding}
                                  value='No'
                                  required>
                                  No
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </ButtonToolbar>
                          </FormGroup>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-md-6">
                          <FormGroup>
                            <ControlLabel>Is it itching?<span className='star'>*</span></ControlLabel>

                            <ButtonToolbar>
                              <ToggleButtonGroup name="itching" type="radio">
                                <ToggleButton
                                  onChange={this.updateItching}
                                  value='Yes'
                                  required>
                                  Yes
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updateItching}
                                  value='No'
                                  required>
                                  No
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </ButtonToolbar>
                          </FormGroup>
                        </div>
                      </div>


                      <div className="row">
                        <div className="col-xs-12 col-md-6">
                          <FormGroup>
                            <ControlLabel>Any history of skin cancer?<span className='star'>*</span></ControlLabel>

                            <ButtonToolbar>
                              <ToggleButtonGroup name="skinCancer" type="radio">
                                <ToggleButton
                                  onChange={this.updateSkinCancer}
                                  value='Yes'
                                  required>
                                  Yes
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updateSkinCancer}
                                  value='No'
                                  required>
                                  No
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </ButtonToolbar>
                          </FormGroup>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-md-6">
                          <FormGroup>
                            <ControlLabel>Are you sexually active?<span className='star'>*</span></ControlLabel>

                            <ButtonToolbar>
                              <ToggleButtonGroup name="sexuallyActive" type="radio">
                                <ToggleButton
                                  onChange={this.updateSexuallyActive}
                                  value='Yes'
                                  required>
                                  Yes
                                </ToggleButton>
                                <ToggleButton
                                  onChange={this.updateSexuallyActive}
                                  value='No'
                                  required>
                                  No
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </ButtonToolbar>
                          </FormGroup>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-6">
                          <div className="form-group">
                            <label>Has it changed in color?<span className='star'>*</span></label>
                            <input onChange={this.updateColor} type="text" className="form-control" required />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-6">
                          <div className="form-group">
                            <label>Have you tried any treatments so far?<span className='star'>*</span></label>
                            <input onChange={this.updatePreviousTreatment} type="text" className="form-control" required />
                          </div>
                        </div>
                      </div>

                      <div className="form-group--heading">
                        Additional Info:
                      </div>
                      <div className="row">
                        <div className="col-xs-5 col-sm-4 col-md-2">
                          <div className="form-group">
                            <label>Age<span className='star'>*</span></label>
                            <input onChange={this.updateAge} type="text" className="form-control" required />
                          </div>
                        </div>
                        <div className="col-xs-12 col-sm-8 col-md-4">
                          <div className="form-group">
                            <label>Country<span className='star'>*</span></label>
                            <input onChange={this.updateCountry} type="text" className="form-control" required />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-8 col-lg-6">
                          <div className="form-group">
                            <label>Please include any additional comments below</label>
                            <textarea onChange={this.updateDescription} className="form-control" rows="5" />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-8 col-lg-6 text-right">
                          <button disabled={!this.state.canSubmit} type="submit" className="btn btn-lg btn-success">Submit Case</button>
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
                  This will cost 5-15 MEDX
                  <br /><span className="text-gray">(depending on if you require a second opinion or not)</span>
                </h5>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button onClick={this.handleCancelConfirmSubmissionModal} type="button" className="btn btn-link">No</button>
            <button onClick={this.handleAcceptConfirmSubmissionModal} type="button" className="btn btn-primary">Yes</button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}))))

export const CreateCaseContainer = withRouter(CreateCase);
