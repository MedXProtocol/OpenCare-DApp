import React, { Component } from 'react'
import { all } from 'redux-saga/effects'
import { connect } from 'react-redux'
import ReactCSSTransitionReplace from 'react-css-transition-replace';
import ReactTimeout from 'react-timeout'
import { cacheCall, withSaga, cacheCallValue, contractByName, nextId } from '~/saga-genesis'
import { Modal } from 'react-bootstrap'
import get from 'lodash.get'
import { EthFaucetAPI } from '~/components/betaFaucet/EthFaucetAPI'
import { AddDoctorAPI } from '~/components/betaFaucet/AddDoctorAPI'
import { weiToEther } from '~/utils/weiToEther'

function mapStateToProps (state) {
  let dontShowEther, dontShowMedX, dontShowAddDoctor
  const address = get(state, 'sagaGenesis.accounts[0]')
  const ethBalance = get(state, 'sagaGenesis.ethBalance.balance')
  const betaFaucetModalDismissed = get(state, 'betaFaucet.betaFaucetModalDismissed')
  const manuallyOpened = get(state, 'betaFaucet.manuallyOpened')
  const MedXToken = contractByName(state, 'MedXToken')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const isOwner = address && (cacheCallValue(state, DoctorManager, 'owner') === address)
  const CaseManager = contractByName(state, 'CaseManager')
  const isDoctor = cacheCallValue(state, DoctorManager, 'isDoctor', address)
  const BetaFaucet = contractByName(state, 'BetaFaucet')
  const hasBeenSentEther = cacheCallValue(state, BetaFaucet, 'sentAddresses', address)

  const externalTransactions = get(state, 'externalTransactions.transactions')
  for (let i = 0; i < externalTransactions.length; i++) {
    const { inFlight, txType, success } = externalTransactions[i]
    if (txType === 'sendEther' && (inFlight || (!inFlight && success))) {
      dontShowEther = true
    } else if (txType === 'sendMedX' && (inFlight || (!inFlight && success))) {
      dontShowMedX = true
    } else if (txType === 'addDoctor' && (inFlight || (!inFlight && success))) {
      dontShowAddDoctor = true
    }
  }

  return {
    address,
    BetaFaucet,
    betaFaucetModalDismissed,
    CaseManager,
    ethBalance,
    hasBeenSentEther,
    DoctorManager,
    MedXToken,
    isOwner,
    isDoctor,
    dontShowEther,
    dontShowMedX,
    dontShowAddDoctor,
    manuallyOpened
  }
}

function* saga({ BetaFaucet, CaseManager, MedXToken, DoctorManager, address }) {
  if (!BetaFaucet || !CaseManager || !MedXToken || !DoctorManager || !address) { return }

  yield all([
    cacheCall(CaseManager, 'getPatientCaseListCount', address),
    cacheCall(DoctorManager, 'owner'),
    cacheCall(BetaFaucet, 'sentAddresses', address),
    yield cacheCall(DoctorManager, 'isDoctor', address)
  ])
}

function mapDispatchToProps(dispatch) {
  return {
    hideModal: () => {
      dispatch({ type: 'HIDE_BETA_FAUCET_MODAL' })
    },
    dispatchAddExternalTransaction: (transactionId, txType, txHash, call) => {
      dispatch({ type: 'ADD_EXTERNAL_TRANSACTION', transactionId, txType, txHash, call })
    },
    dispatchSagaGenesisTransaction: (transactionId, txType, txHash, call) => {
      dispatch({ type: 'TRANSACTION_HASH', transactionId, txHash, call })
    }
  }
}

export const BetaFaucetModal = ReactTimeout(connect(mapStateToProps, mapDispatchToProps)(
  withSaga(saga)(
    class _BetaFaucetModal extends Component {

      constructor(props) {
        super(props)

        this.state = {
          step: 1,
          showBetaFaucetModal: false
        }
      }

      componentDidMount() {
        this.init(this.props)
      }

      componentWillReceiveProps(nextProps) {
        this.init(nextProps)
      }

      init(props) {
        if (props.ethBalance === undefined || props.hasBeenSentEther === undefined) {
          return
        }

        // If they've already seen the faucet or they're currently viewing, skip
        if (props.betaFaucetModalDismissed || this.state.showBetaFaucetModal) {
          return
        }

        let step
        const needEth = (
          !props.hasBeenSentEther
          && weiToEther(props.ethBalance) < 0.1
          && !props.dontShowEther
        )

        const canBeDoctor = (!props.isDoctor && !props.dontShowAddDoctor)


        let showBetaFaucetModal = true

        if (needEth) {
          step = 1
        } else if (canBeDoctor) {
          step = 2
        } else if (props.manuallyOpened) {
          step = -1
        } else {
          showBetaFaucetModal = false
        }

        // Wait for other components to mount and load so the animation doesn't
        // jaggedy jagger
        this.props.setTimeout(() => {
          this.setState({
            showBetaFaucetModal: showBetaFaucetModal,
            step
          })
        }, 1200)
      }

      determineNextStep = () => {
        let nextStep = 1
        if (this.state.step === 1) {
          nextStep = 2
        } else if (this.state.step === 2) {
          nextStep = -1
        }

        this.setState({ step: nextStep })
      }

      addExternalTransaction = (txType, txHash) => {
        const id = nextId()
        const call = { method: txType, address: '0x0444d61FE60A855d6f40C21f167B643fD5F17aF3' } // junk address for cache invalidator to be happy
        this.props.dispatchAddExternalTransaction(id, txType, txHash, call)
        this.props.dispatchSagaGenesisTransaction(id, txType, txHash, call)
      }

      closeModal = () => {
        this.props.hideModal()
        this.setState({
          showBetaFaucetModal: false
        })
      }

      handleMoveToNextStep = (e) => {
        e.preventDefault()

        this.moveToNextStep()
      }

      moveToNextStep = ({ withDelay = false } = {}) => {
        if (withDelay) {
          this.props.setTimeout(this.determineNextStep, 3000)
        } else {
          this.determineNextStep()
        }
      }

      render() {
        let content
        let totalSteps = '2'
        const { showBetaFaucetModal, step } = this.state
        const {
          ethBalance,
          isOwner,
          address,
          isDoctor
        } = this.props

        if (this.props.betaFaucetModalDismissed) { return null }

        if (isOwner) { return null }

        // Don't show this if they've already been onboarded
        if (step === 2 && isDoctor) { return null }

        if (step === 1) {
          content = <EthFaucetAPI
            key="ethFaucet"
            address={address}
            ethBalance={ethBalance}
            moveToNextStep={this.moveToNextStep}
            addExternalTransaction={this.addExternalTransaction}
            handleMoveToNextStep={this.handleMoveToNextStep} />
        } else if (step === 2) {
          content = <AddDoctorAPI
            key="addDoctorAPI"
            address={address}
            moveToNextStep={this.moveToNextStep}
            addExternalTransaction={this.addExternalTransaction}
            handleMoveToNextStep={this.handleMoveToNextStep} />
        } else {
          content = (
            <div className="col-xs-12 text-center">
              <br />
              <br />
              <h2 className="header--no-top-margin">
                You're all set!
              </h2>
              <p>
                There is nothing more to do to start using Hippocrates.
              </p>
              <hr />
              <p>
                <a onClick={this.closeModal} className="btn btn-primary">Close this</a>
              </p>
            </div>
          )
        }

        let stepText

        if (step > 0 && step < 4) {
          stepText = (
            <React.Fragment>
              &nbsp;<small>(Step {step} of {totalSteps})</small>
            </React.Fragment>
          )
        }

        return (
          <Modal show={showBetaFaucetModal} onHide={this.closeModal}>
            <Modal.Header>
              <div className="row">
                <div className="col-xs-12 text-center">
                  <h4>Welcome to the Hippocrates Beta
                    <br className="visible-xs hidden-sm hidden-md hidden-lg" />
                    {stepText}
                  </h4>
                </div>
              </div>
            </Modal.Header>
            <Modal.Body className="modal__beta-faucet">
              <div className="row">
                <ReactCSSTransitionReplace transitionName="page"
                                           transitionEnterTimeout={400}
                                           transitionLeaveTimeout={400}>
                  {content}
                </ReactCSSTransitionReplace>
              </div>
            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
          </Modal>
        );
      }
    }
  )
))
