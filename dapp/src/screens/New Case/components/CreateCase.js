import React, { Component } from 'react';
import {
  ControlLabel,
  FormGroup,
  Modal,
  Radio,
  ProgressBar
} from 'react-bootstrap';
import { genKey } from '~/services/gen-key'
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import Spinner from '../../../components/Spinner';
import { isNotEmptyString } from '../../../utils/common-util';
import { uploadJson, uploadFile } from '../../../utils/storage-util';
import { signedInSecretKey } from '~/services/sign-in'
import { withContractRegistry, cacheCall, cacheCallValue, withSaga, withSend } from '~/saga-genesis'
import hashToHex from '~/utils/hash-to-hex'
import { connect } from 'react-redux'
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

const CreateCase = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['account', 'MedXToken'] })(withSend(class _CreateCase extends Component {
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
            skinCancer: null,
            sexuallyActive: null,
            age: null,
            country: null,
            description: null,
            caseEncryptionKey: genKey(32),


            canSubmit: false,
            submitInProgress: false,
            showBalanceTooLowModal: false,
            showConfirmSubmissionModal: false,
            showThankYouModal: false
        };
    }

    componentWillReceiveProps (props) {
      if (this.state.transactionId) {
        if (get(props, `transactions[${this.state.transactionId}].complete`)) {
          let error = props.transactions[this.state.transactionId].error
          if (error) {
            this.onError(error)
          } else {
            this.onSuccess()
          }
        }
      }
    }

    captureFirstImage = async (event) => {
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
        this.setState({howLong: event.target.value}, this.validateInputs);
    }

    updateSize= (event) => {
        this.setState({size: event.target.value}, this.validateInputs);
    }

    updateSkinCancer= (event) => {
        this.setState({skinCancer: event.target.value}, this.validateInputs);
    }

    updateSexuallyActive= (event) => {
        this.setState({sexuallyActive: event.target.value}, this.validateInputs);
    }

    updateAge = (event) => {
        this.setState({age: event.target.value}, this.validateInputs);
    }

    updateCountry = (event) => {
        this.setState({country: event.target.value}, this.validateInputs);
    }

    updateDescription = (event) => {
        this.setState({description: event.target.value});
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
            isNotEmptyString(this.state.skinCancer) &&
            isNotEmptyString(this.state.sexuallyActive) &&
            isNotEmptyString(this.state.age) &&
            isNotEmptyString(this.state.country);

            this.setState({ canSubmit: valid });
    }

    handleCloseBalanceTooLowModal = (event) => {
        event.preventDefault();

        this.setState({showBalanceTooLowModal: false});
    }

    handleCloseThankYouModal = (event) => {
        event.preventDefault();

        this.setState({showThankYouModal: false});

        this.props.history.push('/');
    }

    handleCancelConfirmSubmissionModal = (event) => {
        event.preventDefault();
        this.setState({showConfirmSubmissionModal: false});
    }

    handleAcceptConfirmSubmissionModal = async (event) => {
        event.preventDefault();

        this.setState({showConfirmSubmissionModal: false});
        await this.createNewCase();
    }

    createNewCase = async () => {
        this.setState({submitInProgress: true});

        const caseInformation = {
            firstImageHash: this.state.firstImageHash,
            secondImageHash: this.state.secondImageHash,
            howLong: this.state.howLong,
            size: this.state.size,
            skinCancer: this.state.skinCancer,
            sexuallyActive: this.state.sexuallyActive,
            age: this.state.age,
            country: this.state.country,
            description: this.state.description
        };

        const caseJson = JSON.stringify(caseInformation);
        const hash = await uploadJson(caseJson, this.state.caseEncryptionKey);
        const encryptedCaseKey = aes.encrypt(this.state.caseEncryptionKey, signedInSecretKey())

        const { send, MedXToken, CaseManager } = this.props
        var hashHex = hashToHex(hash)

        var CaseManagerContract = this.props.contractRegistry.get(this.props.CaseManager, 'CaseManager', getWeb3())
        var data = CaseManagerContract.methods.createCase(this.props.account, '0x' + encryptedCaseKey, '0x' + hashHex).encodeABI()

        this.setState({transactionId: send(MedXToken, 'approveAndCall', CaseManager, 15, data)()})
    }

    onError = (error) => {
      console.error(error)
      this.setState({
          error: error,
          submitInProgress: false
      });
    }

    onSuccess = () => {
        this.setState({submitInProgress: false});
        this.setState({showThankYouModal: true});
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

        return (
            <div>
              <form onSubmit={this.handleSubmit} >
                <div className="row">
                  <div className="col-xs-12 col-md-6">
                    <h3>
                      Submit New Case
                    </h3>
                    <p className="lead">
                      <small>Provide the Doctor with details about your problem. This will be encrypted so only you and your physician(s) will be able to read it.</small>
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-xs-12 col-sm-12 col-md-6">
                    <div className="form-group form-group--image-upload">
                      <label>Overview Photo<span className='star'>*</span></label>
                      <div>
                        <label className="btn btn-primary">
                          Browse... <input onChange={this.captureFirstImage} type="file" accept='image/*' className="form-control" style={{display: 'none'}} required/>
                        </label>
                        <span>
                          {this.state.firstFileName}
                        </span>
                        <div className={firstProgressClassNames}>
                          <ProgressBar
                            active
                            striped
                            bsStyle="info"
                            now={this.state.firstImagePercent} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xs-12 col-sm-12 col-md-6">
                    <div className="form-group">
                      <label>Close-up Photo<span className='star'>*</span></label>
                      <div>
                        <label className="btn btn-primary">
                            Browse... <input onChange={this.captureSecondImage} type="file" accept='image/*' className="form-control" style={{display: 'none'}} required/>
                        </label>
                        <span>
                            {this.state.secondFileName}
                        </span>
                        <div className={secondProgressClassNames}>
                          <ProgressBar
                            active
                            striped
                            bsStyle="info"
                            now={this.state.secondImagePercent} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                  <div className="row">
                    <div className="col-lg-6 col-md-6">
                      <FormGroup>
                        <p>
                         <ControlLabel>How long have you had this problem?<span className='star'>*</span></ControlLabel>
                        </p>
                        <Radio name="radioGroup" inline onChange={this.updateHowLong} name="lengthOfTime" type="radio" value="Days" required>
                          Days
                        </Radio>{' '}
                        <Radio name="radioGroup" inline onChange={this.updateHowLong} name="lengthOfTime" type="radio" value="Weeks" required>
                          Weeks
                        </Radio>{' '}
                        <Radio name="radioGroup" inline onChange={this.updateHowLong} name="lengthOfTime" type="radio" value="Months" required>
                          Months
                        </Radio>{' '}
                        <Radio name="radioGroup" inline onChange={this.updateHowLong} name="lengthOfTime" type="radio" value="Years" required>
                          Years
                        </Radio>
                      </FormGroup>
                    </div>
                    <div className="col-lg-6 col-md-6">
                      <FormGroup>
                        <p>
                          <ControlLabel>Is it growing, shrinking or staying the same size?<span className='star'>*</span></ControlLabel>
                        </p>
                        <Radio name="radioGroup" inline onChange={this.updateSize} name="size" type="radio" value="Growing" required>
                          Growing
                        </Radio>{' '}
                        <Radio name="radioGroup" inline onChange={this.updateSize} name="size" type="radio" value="Shrinking" required>
                          Shrinking
                        </Radio>{' '}
                        <Radio name="radioGroup" inline onChange={this.updateSize} name="size" type="radio" value="Same size" required>
                          Same size
                        </Radio>
                      </FormGroup>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-6 col-md-6">
                      <FormGroup>
                      <p>
                        <ControlLabel>Any history of skin cancer?<span className='star'>*</span></ControlLabel>
                       </p>
                       <Radio name="radioGroup" inline onChange={this.updateSkinCancer} name="skinCancer" type="radio" value="Yes" required>
                         Yes
                       </Radio>{' '}
                       <Radio name="radioGroup" inline onChange={this.updateSkinCancer} name="skinCancer" type="radio" value="No" required>
                         No
                       </Radio>
                     </FormGroup>
                    </div>
                    <div className="col-lg-6 col-md-6">
                      <FormGroup>
                        <p>
                          <ControlLabel>Are you sexually active?<span className='star'>*</span></ControlLabel>
                        </p>
                        <Radio name="radioGroup" inline onChange={this.updateSexuallyActive} name="sexuallyActive" type="radio" value="Yes" required>
                          Yes
                        </Radio>{' '}
                        <Radio name="radioGroup" inline onChange={this.updateSexuallyActive} name="sexuallyActive" type="radio" value="No" required>
                          No
                        </Radio>
                      </FormGroup>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="row">
                      <div className="col-lg-2 col-md-2 col-sm-3 col-xs-5">
                        <label>Age<span className='star'>*</span></label>
                        <input onChange={this.updateAge} type="text" className="form-control" required />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                      <label>Country<span className='star'>*</span></label>
                      <input onChange={this.updateCountry} type="text" className="form-control" required />
                  </div>
                  <div className="form-group">
                      <label>Please include any additional comments below</label>
                      <textarea onChange={this.updateDescription} className="form-control" rows="5" />
                  </div>
                  <div className="form-group">
                    <div className="category"><span className='star'>*</span> Required fields</div>
                  </div>
                  <button disabled={!this.state.canSubmit} type="submit" className="btn btn-fill btn-primary">Submit</button>
                </form>
                <Modal show={this.state.showBalanceTooLowModal}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col text-center">
                                <h4>You need 15 MEDX to submit a case.</h4>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={this.handleCloseBalanceTooLowModal} type="button" className="btn btn-defult">Close</button>
                    </Modal.Footer>
                </Modal>
                <Modal show={this.state.showConfirmSubmissionModal}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col text-center">
                                <h4>Are you sure?</h4>
                                <h5>This will cost 5-15 MEDX (depending on second opinion option)</h5>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={this.handleAcceptConfirmSubmissionModal} type="button" className="btn btn-defult">Yes</button>
                        <button onClick={this.handleCancelConfirmSubmissionModal} type="button" className="btn btn-defult">No</button>
                    </Modal.Footer>
                </Modal>
                <Modal show={this.state.showThankYouModal}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col text-center">
                                <h4>Thank you! Your case submitted successfully.</h4>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={this.handleCloseThankYouModal} type="button" className="btn btn-defult">OK</button>
                    </Modal.Footer>
                </Modal>
                <Spinner loading={this.state.submitInProgress}/>
            </div>
        );
    }
}))))

export default withRouter(CreateCase);
